"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Paperclip, SendHorizontal, Sparkles } from "lucide-react";
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
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to 120px
  const adjustTextareaHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight(textareaRef.current);
  }, [value]);

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSubmit?.(text);
    setValue("");
    adjustTextareaHeight(textareaRef.current);
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
    if (!isFocused && value.length === 0) return 400;
    return 500;
  }, [isFocused, value.length]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex items-end justify-center">
      <motion.div
        layout
        initial={false}
        animate={{ width: "100%", maxWidth: targetWidth }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "pointer-events-auto mx-3 mb-3 sm:mx-6",
          "rounded-xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-xl backdrop-saturate-150",
          "dark:border-white/10 dark:bg-white/5 dark:shadow-2xl",
          "pb-safe",
          className,
        )}
      >
        <div className="relative flex w-full items-end overflow-hidden">
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
      </motion.div>
    </div>
  );
}

export default FloatingChatInput;


