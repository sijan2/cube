"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Paperclip, SendHorizontal, Sparkles, X, ChevronDown, MessageSquare, Mic, MicOff, Volume2, VolumeX, AlertCircle, CheckCircle } from "lucide-react";
import { ThinkingAnimation } from "./thinking-animation-clean";
import { MessageContent } from "./message-content";
import { AIThinking, MessageAvatar, MessageActions, SuggestedPrompts, ScrollToBottom } from "./ai-chat-components";
import { cn } from "@/lib/utils";

type FloatingChatInputProps = {
  placeholder?: string;
  onSubmit?: (text: string) => void;
  className?: string;
};

/**
 * A lightweight, self-contained floating chat input inspired by DynamicChatInput.
 * - Fixed to viewport bottom, centered, respects safe-area inset.
 * - Textarea auto-grows up to 120px.
 * - Enter submits, Shift+Enter inserts newline.
 */
export function FloatingChatInput({
  placeholder = "Ask anything…",
  onSubmit,
  className,
}: FloatingChatInputProps) {
  type ChatMessage = {
    id: string;
    role: "user" | "assistant" | "system";
    text: string;
    at?: number;
  };

  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelData, setPanelData] = useState<{
    title?: string;
    start?: string;
    end?: string;
    location?: string;
  } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const [isActivelyPolling, setIsActivelyPolling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const hoverLeaveTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-grow the textarea up to 120px
  const adjustTextareaHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight(textareaRef.current);
  }, [value]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
          const transcript = event.results[0]?.item(0)?.transcript;
          if (transcript) {
            setValue(prev => prev + (prev ? ' ' : '') + transcript);
          }
        };
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        setSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  // Listen for calendar clicks: open a lightweight info panel above the input
  useEffect(() => {
    const handleOpenPanel = (e: Event) => {
      const ce = e as CustomEvent<any>;
      const ev = ce.detail?.event ?? ce.detail;
      if (ev) {
        const nextData = {
          title: ev.title ?? "Event",
          start: ev.start ? new Date(ev.start).toLocaleString() : undefined,
          end: ev.end ? new Date(ev.end).toLocaleString() : undefined,
          location: ev.location ?? undefined,
        } as const;
        setPanelData(nextData);
      } else {
        setPanelData(null);
      }
      setPanelOpen(true);
      setIsFocused(false);
    };

    const handleClosePanel = () => setPanelOpen(false);

    window.addEventListener("floating-chat:open-panel", handleOpenPanel as EventListener);
    window.addEventListener("floating-chat:close-panel", handleClosePanel);
    const handleAppend = (e: Event) => {
      const ce = e as CustomEvent<any>;
      const role = ce.detail?.role ?? "assistant";
      const text = ce.detail?.text ?? "";
      if (!text) return;
      setMessages(prev => [
        ...prev,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}` , role, text, at: Date.now() },
      ]);
    };
    const handleClear = () => setMessages([]);
    window.addEventListener("floating-chat:append-message", handleAppend as EventListener);
    window.addEventListener("floating-chat:clear-messages", handleClear as EventListener);

    // Auto-speak assistant messages if enabled
    const handleSpeakMessage = (e: Event) => {
      const ce = e as CustomEvent<any>;
      const text = ce.detail?.text;
      if (text) {
        speakText(text);
      }
    };
    window.addEventListener("floating-chat:speak-message", handleSpeakMessage as EventListener);
    return () => {
      window.removeEventListener("floating-chat:open-panel", handleOpenPanel as EventListener);
      window.removeEventListener("floating-chat:close-panel", handleClosePanel);
      window.removeEventListener("floating-chat:append-message", handleAppend as EventListener);
      window.removeEventListener("floating-chat:clear-messages", handleClear as EventListener);
      window.removeEventListener("floating-chat:speak-message", handleSpeakMessage as EventListener);
    };
  }, []);

  // Global Escape closes the panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Auto-scroll chat history to bottom on new messages
  useEffect(() => {
    const scroller = historyRef.current;
    if (!scroller) return;
    // Use rAF for smoothness after DOM paints
    requestAnimationFrame(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
  }, [messages.length]);

  // Inactivity auto-minimize (gentle)
  useEffect(() => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    const shouldArmTimer =
      messages.length > 0 &&
      !isFocused &&
      !isHovered &&
      !panelOpen &&
      value.trim().length === 0 &&
      !isMinimized;
    if (shouldArmTimer) {
      inactivityTimerRef.current = window.setTimeout(() => {
        setIsMinimized(true);
      }, 6000);
    }
    return () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [messages.length, isFocused, isHovered, panelOpen, value, isMinimized]);

  const handleSend = async () => {
    const text = value.trim();
    if (!text) return;

    const MESSAGE = text;

    // Store current query for thinking animation
    setCurrentQuery(MESSAGE);

    // Append to local chat history immediately (optimistic)
    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "user", text: MESSAGE, at: Date.now() },
    ]);

    // Clear input immediately for instant UX
    setValue("");
    adjustTextareaHeight(textareaRef.current);

    // Show thinking animation
    setIsProcessing(true);

    try {
      const response = await fetch("https://mcpcubed.app.n8n.cloud/webhook/input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: MESSAGE
        }),
      });

      const data = await response.json();
      console.log("n8n Webhook Response:", data);

      if (!response.ok) {
        console.error("n8n Webhook Error:", data);
        setIsProcessing(false);
        setCurrentRequestId(null);
        setPollingStartTime(null);
        setIsActivelyPolling(false);
        // Network error occurred but not displaying to user
      } else {
        // Webhook submitted successfully, waiting for SSE response
        console.log("Webhook submitted successfully, waiting for SSE response");
        setPollingStartTime(Date.now());
        setSuccessMessage("Message sent successfully. Waiting for response...");
        setTimeout(() => setSuccessMessage(null), 3000);

        // Set 10-minute timeout for thinking animation
        setTimeout(() => {
          if (isProcessing) {
            setIsProcessing(false);
            setCurrentRequestId(null);
            setPollingStartTime(null);
            setIsActivelyPolling(false);

            setMessages(prev => [
              ...prev,
              { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "assistant", text: "⏰ Your request has been processing for 10 minutes. The mcp² services are handling a complex analysis - you can continue chatting and I'll update you when ready!", at: Date.now() },
            ]);
          }
        }, 600000); // 10 minutes
      }
    } catch (error) {
      console.error("n8n Webhook Error:", error);
      setIsProcessing(false);
      setCurrentRequestId(null);
      setPollingStartTime(null);
      setIsActivelyPolling(false);
      // Network error occurred but not displaying to user
    }

    onSubmit?.(text);
    // Optionally collapse any open panel after sending a message
    setPanelOpen(false);

    // Auto-minimize shortly after send for a tidy UI
    window.setTimeout(() => setIsMinimized(true), 1200);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        // For now, we'll use the Web Speech API instead
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const speakText = (text: string) => {
    if (synthesis && !isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesis && isSpeaking) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Simple SSE connection for broadcast responses
  const connectToResponseStream = () => {
    try {
      const eventSource = new EventSource(`http://localhost:3002/api/chat/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'response' && data.message) {
            // Response received via SSE broadcast
            console.log('Received response via SSE broadcast');

            // Response received successfully
            setSuccessMessage(null);

            // Hide thinking animation if we're currently processing
            setIsProcessing(false);
            setCurrentRequestId(null);
            setPollingStartTime(null);
            setIsActivelyPolling(false);

            // Add assistant response to chat history
            setMessages(prev => [
              ...prev,
              { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "assistant", text: data.message, at: Date.now() },
            ]);

            // Auto-speak the response if synthesis is available
            if (synthesis && data.message) {
              speakText(data.message);
            }
          } else if (data.type === 'connected') {
            console.log('SSE stream connected successfully');
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        eventSourceRef.current = null;

        // Reconnect after 5 seconds
        setTimeout(() => {
          if (!eventSourceRef.current) {
            connectToResponseStream();
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
    }
  };

  // Polling function as fallback
  const pollForResponse = async (requestId: string) => {
    const POLLING_START_DELAY = 60000; // Wait 60 seconds before starting to poll
    const POLLING_INTERVAL = 5000; // Poll every 5 seconds
    const TOTAL_TIMEOUT = 600000; // 10 minutes total (600 seconds)
    const MAX_POLLING_TIME = TOTAL_TIMEOUT - POLLING_START_DELAY; // 540 seconds of actual polling
    const maxAttempts = Math.floor(MAX_POLLING_TIME / POLLING_INTERVAL); // 108 attempts (540/5)

    let attempts = 0;

    const poll = async () => {
      // Check if component is still mounted and processing
      if (!isProcessing || currentRequestId !== requestId) {
        return; // Stop polling if component unmounted or new request started
      }

      // Set actively polling flag on first poll attempt
      if (attempts === 0) {
        setIsActivelyPolling(true);
        console.log(`Now actively polling for ${requestId} every 5 seconds...`);
      }

      try {
        const response = await fetch(`http://localhost:3002/api/chat/poll/${requestId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data.message) {
            // Clear polling timeout
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }

            // Hide thinking animation
            setIsProcessing(false);
            setCurrentRequestId(null);
            setPollingStartTime(null);
            setIsActivelyPolling(false);

            // Add assistant response to chat history
            setMessages(prev => [
              ...prev,
              { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "assistant", text: data.message, at: Date.now() },
            ]);

            // Auto-speak the response if synthesis is available
            if (synthesis && data.message) {
              speakText(data.message);
            }
            return; // Success - stop polling
          }
        }

        // Continue polling if no response yet
        attempts++;
        if (attempts < maxAttempts) {
          pollingTimeoutRef.current = setTimeout(poll, POLLING_INTERVAL); // Poll every 5 seconds
        } else {
          // Timeout after 10 minutes total
          setIsProcessing(false);
          setCurrentRequestId(null);
          setPollingStartTime(null);
          setIsActivelyPolling(false);

          setMessages(prev => [
            ...prev,
            { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "assistant", text: "⏰ Your request has been processing for 10 minutes. The mcp² services are handling a complex analysis - you can continue chatting and I'll update you when the response is ready!", at: Date.now() },
          ]);
        }
      } catch (error) {
        console.error("Polling error:", error);
        attempts++;
        if (attempts < maxAttempts && isProcessing && currentRequestId === requestId) {
          pollingTimeoutRef.current = setTimeout(poll, POLLING_INTERVAL); // Continue polling even on error
        } else {
          setIsProcessing(false);
          setCurrentRequestId(null);
          setPollingStartTime(null);
          setIsActivelyPolling(false);
        }
      }
    };

    // Start polling after 60 seconds
    console.log(`Starting polling for ${requestId} in 60 seconds. Will poll every 5 seconds for 9 minutes.`);
    pollingTimeoutRef.current = setTimeout(poll, POLLING_START_DELAY);
  };

  // Connect to SSE stream on mount
  useEffect(() => {
    connectToResponseStream();

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isProcessing) {
        handleSend();
      }
    } else if (e.key === "Escape") {
      (e.target as HTMLTextAreaElement).blur();
      setIsFocused(false);
    }
  };

  // Compact width when not focused/value empty on larger screens
  const targetWidth = useMemo(() => {
    if (isMinimized) return 280;
    if (!isFocused && value.length === 0) return 400;
    return 500;
  }, [isFocused, value.length, isMinimized]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex items-end justify-center">
      <motion.div
        layout
        initial={false}
        animate={{ width: "100%", maxWidth: targetWidth }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "pointer-events-auto mx-3 mb-3 sm:mx-6 group",
          "rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl backdrop-blur-xl backdrop-saturate-150",
          "pb-safe",
          className,
        )}
        onMouseEnter={() => {
          setIsHovered(true);
          if (hoverLeaveTimerRef.current) {
            window.clearTimeout(hoverLeaveTimerRef.current);
            hoverLeaveTimerRef.current = null;
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (hoverLeaveTimerRef.current) {
            window.clearTimeout(hoverLeaveTimerRef.current);
          }
          // Gentle auto-reminimize when leaving, if idle
          if (!isFocused && !panelOpen && value.trim().length === 0) {
            hoverLeaveTimerRef.current = window.setTimeout(() => {
              setIsMinimized(true);
            }, 1200);
          }
        }}
      >
        <div className="relative flex w-full flex-col overflow-hidden">
          {/* Hover-only minimize control (hidden on mobile) */}
          {!panelOpen && !isMinimized && (
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className={cn(
              "hidden sm:flex absolute right-2 top-2 size-7 items-center justify-center rounded-md text-zinc-400",
              "transition-opacity hover:bg-zinc-800 hover:text-white",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
            )}
            aria-label="Minimize"
          >
            <ChevronDown size={14} />
          </button>
          )}

          {/* Minimized pill */}
          <AnimatePresence initial={false}>
            {isMinimized && (
              <motion.button
                key="minimized-pill"
                type="button"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onMouseEnter={() => setIsMinimized(false)}
                onClick={() => setIsMinimized(false)}
                onTouchStart={() => setIsMinimized(false)}
                className={cn(
                  "flex w-full items-center gap-2 px-3.5 py-2",
                  "text-sm text-zinc-200",
                )}
                aria-expanded={!isMinimized}
              >
                <MessageSquare size={16} className="opacity-70" />
                <span className="truncate">
                  {messages[messages.length - 1]?.text || "Ask anything…"}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {!isMinimized && (
            <>
          <AnimatePresence initial={false}>
            {panelOpen && (
              <motion.div
                key="floating-panel"
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full border-b border-zinc-800"
              >
                <div className="flex items-start gap-2 px-3.5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-100">
                      {panelData?.title ?? "Event"}
                    </div>
                    {(panelData?.start || panelData?.location) && (
                      <div className="mt-0.5 line-clamp-2 text-xs text-zinc-400">
                        {panelData?.start}
                        {panelData?.end ? ` — ${panelData.end}` : ""}
                        {panelData?.location ? ` · ${panelData.location}` : ""}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat history */}
          <AnimatePresence initial={false}>
            {(messages.length > 0 || isProcessing) && (
              <motion.div
                key="chat-history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full border-b border-zinc-800"
              >
                <div
                  ref={historyRef}
                  className="max-h-60 overflow-y-auto px-3.5 py-2 bg-zinc-900 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
                >
                  {messages.map((m, idx) => (
                    <div
                      key={m.id}
                      className={cn(
                        "mt-3 flex gap-2 group",
                        m.role === "user" ? "justify-end flex-row-reverse" : "justify-start",
                      )}
                    >
                      <MessageAvatar role={m.role} />
                      <div className="flex flex-col gap-1 max-w-[80%]">
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5",
                            m.role === "user"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                              : m.role === "assistant"
                              ? "bg-zinc-800 backdrop-blur-sm border border-zinc-700 shadow-sm"
                              : "bg-zinc-800 border border-zinc-700",
                          )}
                        >
                          <MessageContent
                            content={m.text}
                            role={m.role}
                            className={cn(
                              m.role === "user" && "!text-white prose-headings:!text-white prose-strong:!text-white prose-em:!text-white/90",
                              m.role === "assistant" && "!text-white prose-headings:!text-white prose-strong:!text-white"
                            )}
                          />
                        </div>
                        {m.role === "assistant" && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageActions
                              onCopy={() => navigator.clipboard.writeText(m.text)}
                              onRegenerate={() => console.log("Regenerate", m.id)}
                              onFeedback={(type) => console.log("Feedback", type, m.id)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Thinking animation */}
                  {isProcessing && (
                    <div className="mt-3 flex gap-2">
                      <MessageAvatar role="assistant" />
                      <div className="max-w-[80%]">
                        <AIThinking
                          state={isActivelyPolling ? "searching" : "thinking"}
                          message={isActivelyPolling ? "Searching for your answer..." : "Processing your request..."}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Messages */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-3.5 py-2 border-b border-zinc-800 bg-zinc-900"
              >
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle size={16} />
                  <span>{successMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Row */}
          <div className="relative flex w-full items-end">
          <label htmlFor="floating-chat-input" className="sr-only">
            Chat input
          </label>
          <textarea
            ref={textareaRef}
            id="floating-chat-input"
            name="floating-chat-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "w-full resize-none border-none bg-transparent px-3.5 py-3 text-sm leading-6",
              "text-white placeholder:text-zinc-400",
              "outline-none",
            )}
          />
          <div className="flex h-12 shrink-0 items-center gap-1.5 self-end px-2">
            {/* Voice controls - always visible */}
            <button
              type="button"
              onClick={isSpeaking ? stopSpeaking : () => {}}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors",
                isSpeaking
                  ? "bg-red-600 text-white"
                  : "text-zinc-400 hover:text-white"
              )}
              aria-label={isSpeaking ? "Stop speaking" : "Text to speech"}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors",
                isListening
                  ? "bg-blue-600 text-white animate-pulse"
                  : "text-zinc-400 hover:text-white"
              )}
              aria-label={isListening ? "Stop listening" : "Voice to text"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <AnimatePresence>
              {value && (
                <>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-white"
                    aria-label="AI assist"
                  >
                    <Sparkles size={16} />
                  </motion.button>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15, delay: 0.05 }}
                    className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-white"
                    aria-label="Attach"
                  >
                    <Paperclip size={16} />
                  </motion.button>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15, delay: 0.1 }}
                    className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-white"
                    aria-label="Create event"
                  >
                    <Calendar size={16} />
                  </motion.button>
                </>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={handleSend}
              disabled={!value.trim() || isProcessing}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors active:scale-[0.98]",
                "disabled:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed",
                isProcessing && "animate-pulse"
              )}
              aria-label={isProcessing ? "Processing..." : "Send"}
            >
              <SendHorizontal size={16} />
            </button>
          </div>
          </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default FloatingChatInput;


