"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Zap,
  Brain,
  Bot,
  User,
  RefreshCw,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Typing indicator component
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="size-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// AI thinking component with multiple states
export function AIThinking({
  state = "thinking",
  message
}: {
  state?: "thinking" | "searching" | "analyzing" | "generating";
  message?: string;
}) {
  const icons = {
    thinking: Brain,
    searching: RefreshCw,
    analyzing: Zap,
    generating: Sparkles,
  };

  const Icon = icons[state];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800"
    >
      <motion.div
        animate={{ rotate: state === "searching" ? 360 : 0 }}
        transition={{ duration: 2, repeat: state === "searching" ? Infinity : 0, ease: "linear" }}
      >
        <Icon className="size-5 text-blue-600 dark:text-blue-400" />
      </motion.div>
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {message || `AI is ${state}...`}
        </p>
        <TypingIndicator className="mt-1" />
      </div>
    </motion.div>
  );
}

// Message avatar component
export function MessageAvatar({ role }: { role: "user" | "assistant" | "system" }) {
  const icons = {
    user: User,
    assistant: Bot,
    system: Zap,
  };

  const Icon = icons[role];
  const colors = {
    user: "bg-blue-500 text-white",
    assistant: "bg-gradient-to-br from-purple-500 to-blue-500 text-white",
    system: "bg-zinc-500 text-white",
  };

  return (
    <div className={cn("size-8 rounded-full flex items-center justify-center shadow-md", colors[role])}>
      <Icon size={16} />
    </div>
  );
}

// Message actions toolbar
export function MessageActions({
  onCopy,
  onRegenerate,
  onFeedback,
  className
}: {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: "up" | "down") => void;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [feedback, setFeedback] = React.useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    onFeedback?.(type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-zinc-800 shadow-md border border-zinc-200 dark:border-zinc-700",
        className
      )}
    >
      <button
        onClick={handleCopy}
        className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Copy message"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>

      <button
        onClick={onRegenerate}
        className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Regenerate response"
      >
        <RefreshCw size={14} />
      </button>

      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

      <button
        onClick={() => handleFeedback("up")}
        className={cn(
          "p-1.5 rounded transition-colors",
          feedback === "up"
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
        )}
        aria-label="Good response"
      >
        <ThumbsUp size={14} />
      </button>

      <button
        onClick={() => handleFeedback("down")}
        className={cn(
          "p-1.5 rounded transition-colors",
          feedback === "down"
            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
        )}
        aria-label="Bad response"
      >
        <ThumbsDown size={14} />
      </button>

      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

      <button
        className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        aria-label="More options"
      >
        <MoreHorizontal size={14} />
      </button>
    </motion.div>
  );
}

// Suggested prompts component
export function SuggestedPrompts({
  prompts,
  onSelect
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(prompt)}
          className="px-3 py-1.5 rounded-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-blue-500 group-hover:animate-pulse" />
            {prompt}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// Scroll to bottom button
export function ScrollToBottom({
  onClick,
  show
}: {
  onClick: () => void;
  show: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClick}
          className="absolute bottom-4 right-4 p-2 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-all"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Token counter component
export function TokenCounter({
  current,
  max
}: {
  current: number;
  max: number;
}) {
  const percentage = (current / max) * 100;
  const isWarning = percentage > 75;
  const isDanger = percentage > 90;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="relative w-24 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isDanger ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-blue-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className={cn(
        "font-mono",
        isDanger ? "text-red-500" : isWarning ? "text-yellow-500" : "text-zinc-500"
      )}>
        {current.toLocaleString()}/{max.toLocaleString()}
      </span>
    </div>
  );
}