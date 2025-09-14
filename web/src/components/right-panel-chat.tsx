"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SendHorizontal, Mic, MicOff, Volume2, VolumeX, CheckCircle, MessageSquare, ChevronRight, Move, Minus, GripVertical } from "lucide-react";
import { MessageContent } from "./message-content";
import { MessageAvatar, MessageActions } from "./ai-chat-components";
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number>(384); // px
  const [panelHeight, setPanelHeight] = useState<number>(600); // px (floating)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      // Initialize floating defaults near the right edge
      setPos({ x: Math.max(16, window.innerWidth - panelWidth - 24), y: 24 });
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

  // Utilities
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  // Docked width resize (left edge)
  const handleDockedResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFloating) return;
    const startX = e.clientX;
    const startWidth = panelWidth;
    const onMove = (ev: PointerEvent) => {
      const delta = startX - ev.clientX; // dragging left increases width
      const next = clamp(startWidth + delta, 320, 720);
      setPanelWidth(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  // Floating drag (header)
  const handleFloatingDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFloating) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...pos };
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const maxX = (typeof window !== 'undefined' ? window.innerWidth : 0) - panelWidth - 8;
      const maxY = (typeof window !== 'undefined' ? window.innerHeight : 0) - panelHeight - 8;
      setPos({
        x: clamp(startPos.x + dx, 8, Math.max(8, maxX)),
        y: clamp(startPos.y + dy, 8, Math.max(8, maxY)),
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  // Floating resize (bottom-right corner)
  const handleFloatingResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFloating) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelWidth;
    const startH = panelHeight;
    const onMove = (ev: PointerEvent) => {
      const nextW = clamp(startW + (ev.clientX - startX), 320, Math.min(900, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 16));
      const nextH = clamp(startH + (ev.clientY - startY), 280, Math.min(900, (typeof window !== 'undefined' ? window.innerHeight : 900) - 16));
      setPanelWidth(nextW);
      setPanelHeight(nextH);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  // Removed bubble drag; bottom pill is fixed in bottom-right

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

  // Close on outside click, except when clicking calendar events
  useEffect(() => {
    if (!isExpanded) return;
    const handlePointerDown = (e: MouseEvent) => {
      const panel = document.getElementById('right-panel-chat-container');
      if (!panel) return;
      const target = e.target as HTMLElement | null;
      const clickedInside = panel.contains(target);
      const clickedCalendarEvent = target?.closest('[data-calendar-event="true"]');
      if (!clickedInside && !clickedCalendarEvent) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isExpanded]);

  // Global toggle/open events for floating chat
  useEffect(() => {
    const handleToggleFloating = () => {
      setIsFloating(true);
      setIsExpanded((prev) => !prev);
    };
    const handleOpenFloating = () => {
      setIsFloating(true);
      setIsExpanded(true);
    };
    const handleOpenDocked = () => {
      setIsFloating(false);
      setIsExpanded(true);
    };
    window.addEventListener('right-panel-chat:toggle-floating', handleToggleFloating as EventListener);
    window.addEventListener('right-panel-chat:open-floating', handleOpenFloating as EventListener);
    window.addEventListener('right-panel-chat:open-docked', handleOpenDocked as EventListener);
    return () => {
      window.removeEventListener('right-panel-chat:toggle-floating', handleToggleFloating as EventListener);
      window.removeEventListener('right-panel-chat:open-floating', handleOpenFloating as EventListener);
      window.removeEventListener('right-panel-chat:open-docked', handleOpenDocked as EventListener);
    };
  }, [isExpanded]);

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
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      {/* Removed mid-right collapsed tab to keep only one bottom entry point */}

      {/* Minimized floating bubble */}
      {!isExpanded && (
        <div
          className="pointer-events-auto fixed right-4 bottom-4 flex items-center gap-2 px-3 h-10 rounded-full bg-background/95 border border-border shadow-xl cursor-pointer hover:bg-muted/95 transition-colors"
          onClick={() => { setIsExpanded(true); setIsFloating(false); }}
          aria-label="Open chat"
        >
          <MessageSquare size={16} className="text-muted-foreground" />
          <span className="text-xs text-foreground">Open Chat</span>
        </div>
      )}

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: isFloating ? 0 : 100 }}
            animate={{ x: 0 }}
            exit={{ x: isFloating ? 0 : 100 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto flex flex-col shadow-2xl",
              isFloating
                ? "fixed border border-border bg-background rounded-lg"
                : "fixed right-0 top-0 bottom-0 bg-background border-l border-border rounded-l-lg"
            )}
            style={
              isFloating
                ? { left: pos.x, top: pos.y, width: panelWidth, height: panelHeight }
                : { width: panelWidth }
            }
            id="right-panel-chat-container"
          >
            {/* Docked left-edge resizer */}
            {!isFloating && (
              <div
                onPointerDown={handleDockedResizeStart}
                className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-50 hover:opacity-100"
              />
            )}

            {/* Header (drag handle in floating mode) */}
            <div
              className={cn(
                "flex items-center justify-between p-3 border-b border-border select-none",
                isFloating ? "cursor-move" : ""
              )}
              onPointerDown={handleFloatingDragStart}
            >
              <div className="flex items-center gap-2">
                {isFloating && <GripVertical size={14} className="text-muted-foreground" />}
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute top-0"></div>
                </div>
                <span className="text-sm font-medium text-foreground">mcp² Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (!isFloating) {
                      setIsFloating(true);
                      setIsExpanded(true);
                    } else {
                      setIsFloating(false);
                    }
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={isFloating ? "Dock" : "Undock / Float"}
                >
                  <Move size={16} />
                </button>
                <button
                  onClick={() => {
                    // Minimize to bottom pill and docked mode
                    setIsFloating(false);
                    setIsExpanded(false);
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Minimize"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 flex flex-col min-h-0 rounded-b-lg">
              <div
                ref={historyRef}
                className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide"
              >
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-center">
                    <p className="text-sm text-muted-foreground">
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
                            ? "bg-foreground text-background"
                            : "bg-muted border border-border text-foreground"
                        )}
                      >
                        <MessageContent
                          content={m.text}
                          role={m.role}
                          className={cn(
                            "text-sm",
                            m.role === "user"
                              ? "!text-background prose-headings:!text-background prose-p:!text-background prose-strong:!text-background"
                              : "!text-foreground prose-headings:!text-foreground prose-p:!text-foreground"
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
                    className="px-4 py-2 border-t border-border"
                  >
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle size={14} />
                      <span>{successMessage}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholder}
                      rows={1}
                      className={cn(
                        "w-full resize-none border border-border bg-muted px-3 py-2 text-sm text-foreground",
                        "rounded-lg placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
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
                          ? "bg-destructive text-destructive-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                          ? "bg-foreground text-background animate-pulse"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!value.trim() || isProcessing}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg bg-foreground text-background",
                        "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        "hover:bg-foreground/90 active:scale-95"
                      )}
                    >
                      <SendHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating bottom-right resizer */}
            {isFloating && (
              <div
                onPointerDown={handleFloatingResizeStart}
                className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}