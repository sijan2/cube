"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Paperclip, SendHorizontal, Sparkles, X, ChevronDown, MessageSquare } from "lucide-react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const hoverLeaveTimerRef = useRef<number | null>(null);

  // Auto-grow the textarea up to 120px
  const adjustTextareaHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight(textareaRef.current);
  }, [value]);

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
    return () => {
      window.removeEventListener("floating-chat:open-panel", handleOpenPanel as EventListener);
      window.removeEventListener("floating-chat:close-panel", handleClosePanel);
      window.removeEventListener("floating-chat:append-message", handleAppend as EventListener);
      window.removeEventListener("floating-chat:clear-messages", handleClear as EventListener);
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

    // Append to local chat history immediately (optimistic)
    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "user", text: MESSAGE, at: Date.now() },
    ]);

    // Clear input immediately for instant UX
    setValue("");
    adjustTextareaHeight(textareaRef.current);

    try {
      const response = await fetch("http://localhost:3002/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: MESSAGE }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        console.error("API Error from proxy:", data);
      }
    } catch (error) {
      console.error("API Error:", error);
    }

    onSubmit?.(text);
    // Optionally collapse any open panel after sending a message
    setPanelOpen(false);

    // Auto-minimize shortly after send for a tidy UI
    window.setTimeout(() => setIsMinimized(true), 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
          "rounded-xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-xl backdrop-saturate-150",
          "dark:border-white/10 dark:bg-white/5 dark:shadow-2xl",
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
              "hidden sm:flex absolute right-2 top-2 size-7 items-center justify-center rounded-md text-zinc-500",
              "transition-opacity hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100",
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
                  "text-sm text-zinc-700 dark:text-zinc-200",
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
                className="w-full border-b border-white/20 dark:border-white/10"
              >
                <div className="flex items-start gap-2 px-3.5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {panelData?.title ?? "Event"}
                    </div>
                    {(panelData?.start || panelData?.location) && (
                      <div className="mt-0.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {panelData?.start}
                        {panelData?.end ? ` — ${panelData.end}` : ""}
                        {panelData?.location ? ` · ${panelData.location}` : ""}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
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
            {messages.length > 0 && (
              <motion.div
                key="chat-history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full border-b border-white/20 dark:border-white/10"
              >
                <div
                  ref={historyRef}
                  className="max-h-60 overflow-y-auto px-3.5 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
                >
                  {messages.map(m => (
                    <div
                      key={m.id}
                      className={cn(
                        "mt-1 flex",
                        m.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3 py-1.5 text-sm",
                          m.role === "user"
                            ? "bg-blue-500 text-white"
                            : m.role === "assistant"
                            ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-zinc-100"
                            : "bg-zinc-200 text-zinc-800 dark:bg-white/5 dark:text-zinc-200",
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
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
              "text-zinc-900 placeholder:text-zinc-500",
              "dark:text-zinc-100 dark:placeholder:text-zinc-400",
              "outline-none",
            )}
          />
          <div className="flex h-12 shrink-0 items-center gap-1.5 self-end px-2">
            <AnimatePresence>
              {value && (
                <>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="flex size-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
                    className="flex size-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
                    className="flex size-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
              disabled={!value.trim()}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors active:scale-[0.98]",
                "disabled:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed",
                "dark:disabled:bg-zinc-500",
              )}
              aria-label="Send"
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


