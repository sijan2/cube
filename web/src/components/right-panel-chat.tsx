"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SendHorizontal, Mic, MicOff, Volume2, VolumeX, AlertCircle, CheckCircle, X, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { MessageContent } from "./message-content";
import { AIThinking, MessageAvatar, MessageActions } from "./ai-chat-components";
import { MCPWorkflowThinking } from "./mcp-workflow-thinking";
import { cn } from "@/lib/utils";

type RightPanelChatProps = {
  placeholder?: string;
  onSubmit?: (text: string) => void;
  className?: string;
};

export function RightPanelChat({
  placeholder = "Ask mcp² anything…",
  onSubmit,
  className,
}: RightPanelChatProps) {
  type ChatMessage = {
    id: string;
    role: "user" | "assistant" | "system";
    text: string;
    at?: number;
  };

  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Auto-grow the textarea
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

  const handleSend = async () => {
    const text = value.trim();
    if (!text) return;

    // Add to local chat history immediately
    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "user", text, at: Date.now() },
    ]);

    setValue("");
    adjustTextareaHeight(textareaRef.current);
    setIsProcessing(true);

    try {
      const response = await fetch("https://mcpcubed.app.n8n.cloud/webhook/input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text
        }),
      });

      const data = await response.json();
      console.log("n8n Webhook Response:", data);

      if (!response.ok) {
        console.error("n8n Webhook Error:", data);
        setIsProcessing(false);
      } else {
        console.log("Webhook submitted successfully, waiting for SSE response");
        setPollingStartTime(Date.now());
        setSuccessMessage("Message sent successfully. Waiting for response...");
        setTimeout(() => setSuccessMessage(null), 3000);

        setTimeout(() => {
          if (isProcessing) {
            setIsProcessing(false);
            setMessages(prev => [
              ...prev,
              { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "assistant", text: "⏰ Your request is being processed by the mcp² services. I'll update you when ready!", at: Date.now() },
            ]);
          }
        }, 600000);
      }
    } catch (error) {
      console.error("n8n Webhook Error:", error);
      setIsProcessing(false);
    }

    onSubmit?.(text);
  };

  // SSE connection
  const connectToResponseStream = () => {
    try {
      const eventSource = new EventSource(`http://localhost:3002/api/chat/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'response' && data.message) {
            console.log('Received response via SSE broadcast');
            setSuccessMessage(null);
            setIsProcessing(false);

            setMessages(prev => [
              ...prev,
              { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "assistant", text: data.message, at: Date.now() },
            ]);

            if (synthesis && data.message) {
              speakText(data.message);
            }
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        eventSourceRef.current = null;

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

  // Auto-scroll chat history
  useEffect(() => {
    const scroller = historyRef.current;
    if (!scroller) return;
    requestAnimationFrame(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
  }, [messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isProcessing) {
        handleSend();
      }
    }
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 z-50 flex">
      {/* Collapsed Tab */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-center w-12 h-32 bg-zinc-900 border-l border-zinc-800 rounded-l-lg self-center shadow-lg hover:bg-zinc-800 transition-colors group"
          >
            <div className="flex flex-col items-center gap-2">
              <MessageSquare size={16} className="text-zinc-400 group-hover:text-zinc-200" />
              <div className="text-xs text-zinc-400 group-hover:text-zinc-200 [writing-mode:vertical-lr] rotate-180">
                Chat
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-96 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute top-0"></div>
                </div>
                <span className="text-sm font-medium text-zinc-100">mcp² Assistant</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 flex flex-col min-h-0">
              <div
                ref={historyRef}
                className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide"
              >
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-center">
                    <p className="text-sm text-zinc-400">
                      Start a conversation with your<br />personal AI assistant
                    </p>
                  </div>
                )}

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "mb-4 flex gap-3 group",
                      m.role === "user" ? "justify-end flex-row-reverse" : "justify-start",
                    )}
                  >
                    <MessageAvatar role={m.role} />
                    <div className="flex flex-col gap-1 max-w-[75%]">
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2",
                          m.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-100"
                        )}
                      >
                        <MessageContent
                          content={m.text}
                          role={m.role}
                          className={cn(
                            "text-sm",
                            m.role === "user"
                              ? "!text-white prose-headings:!text-white prose-p:!text-white prose-strong:!text-white"
                              : "!text-zinc-100 prose-headings:!text-zinc-100 prose-p:!text-zinc-100"
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

                {/* MCP Workflow Thinking */}
                {isProcessing && (
                  <div className="mb-4">
                    <MCPWorkflowThinking />
                  </div>
                )}
              </div>

              {/* Status Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-4 py-2 border-t border-zinc-800"
                  >
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle size={14} />
                      <span>{successMessage}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="border-t border-zinc-800 p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder={placeholder}
                      rows={1}
                      className={cn(
                        "w-full resize-none border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100",
                        "rounded-lg placeholder:text-zinc-400",
                        "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
                      )}
                    />
                  </div>

                  {/* Voice Controls */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={isSpeaking ? stopSpeaking : () => {}}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg transition-colors",
                        isSpeaking
                          ? "bg-red-600 text-white"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                      )}
                    >
                      {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>

                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg transition-colors",
                        isListening
                          ? "bg-blue-600 text-white animate-pulse"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                      )}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!value.trim() || isProcessing}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white",
                        "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        "hover:bg-blue-500 active:scale-95"
                      )}
                    >
                      <SendHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}