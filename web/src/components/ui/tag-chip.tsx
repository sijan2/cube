"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TagChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: "sm" | "md";
  variant?: "default" | "mcp";
};

export function TagChip({ className, size = "sm", variant = "default", children, ...props }: TagChipProps) {
  const tagText = typeof children === "string" ? children.toLowerCase() : "";

  // Determine the styling based on the tag content
  const getTagStyles = () => {
    // MCP Integration Tags
    if (tagText === "linear mcp") {
      return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    }
    if (tagText === "canvas mcp") {
      return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    }
    if (tagText.includes("mcp")) {
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    }

    // Career & Work Tags
    if (tagText === "career" || tagText === "interview") {
      return "bg-red-500/20 text-red-400 border border-red-500/30";
    }
    if (tagText === "urgent" || tagText === "critical") {
      return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
    }
    if (tagText === "deadline") {
      return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    }

    // Development & Tech Tags
    if (tagText === "development" || tagText === "dev" || tagText === "code") {
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    }
    if (tagText === "team" || tagText === "collaboration") {
      return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
    }

    // Academic Tags
    if (tagText.includes("cmsc") || tagText.includes("bmgt") || tagText.includes("math")) {
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
    if (tagText === "homework" || tagText === "assignment" || tagText === "exam") {
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    }
    if (tagText === "lecture" || tagText === "class") {
      return "bg-teal-500/20 text-teal-400 border border-teal-500/30";
    }

    // Status Tags
    if (tagText === "completed" || tagText === "done") {
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    }
    if (tagText === "in progress" || tagText === "active") {
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    }
    if (tagText === "pending" || tagText === "todo") {
      return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }

    // Project Management
    if (tagText === "milestone" || tagText === "sprint") {
      return "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
    }
    if (tagText === "bug" || tagText === "issue") {
      return "bg-red-500/20 text-red-400 border border-red-500/30";
    }
    if (tagText === "feature" || tagText === "enhancement") {
      return "bg-violet-500/20 text-violet-400 border border-violet-500/30";
    }

    // Communication Tags
    if (tagText === "meeting" || tagText === "standup") {
      return "bg-pink-500/20 text-pink-400 border border-pink-500/30";
    }
    if (tagText === "email" || tagText === "message") {
      return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
    }

    // Personal Tags
    if (tagText === "personal" || tagText === "life") {
      return "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30";
    }
    if (tagText === "health" || tagText === "fitness") {
      return "bg-lime-500/20 text-lime-400 border border-lime-500/30";
    }

    // Default colorful fallback based on first letter
    const firstChar = tagText.charAt(0);
    const colorMap: { [key: string]: string } = {
      'a': "bg-red-500/20 text-red-400 border border-red-500/30",
      'b': "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      'c': "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      'd': "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      'e': "bg-lime-500/20 text-lime-400 border border-lime-500/30",
      'f': "bg-green-500/20 text-green-400 border border-green-500/30",
      'g': "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      'h': "bg-teal-500/20 text-teal-400 border border-teal-500/30",
      'i': "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
      'j': "bg-sky-500/20 text-sky-400 border border-sky-500/30",
      'k': "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      'l': "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
      'm': "bg-violet-500/20 text-violet-400 border border-violet-500/30",
      'n': "bg-purple-500/20 text-purple-400 border border-purple-500/30",
      'o': "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30",
      'p': "bg-pink-500/20 text-pink-400 border border-pink-500/30",
      'q': "bg-rose-500/20 text-rose-400 border border-rose-500/30",
      'r': "bg-red-500/20 text-red-400 border border-red-500/30",
      's': "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      't': "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      'u': "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      'v': "bg-lime-500/20 text-lime-400 border border-lime-500/30",
      'w': "bg-green-500/20 text-green-400 border border-green-500/30",
      'x': "bg-teal-500/20 text-teal-400 border border-teal-500/30",
      'y': "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
      'z': "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    };

    return colorMap[firstChar] || "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  };

  // Check if it's an MCP or important tag for bold styling
  const isImportant = tagText.includes("mcp") || tagText === "urgent" || tagText === "critical" || tagText === "deadline";

  return (
    <span
      className={cn(
        "inline-block rounded transition-colors",
        getTagStyles(),
        size === "sm" && "px-1.5 py-0.5 text-[10px] font-medium",
        size === "md" && "px-2 py-0.5 text-xs font-medium",
        isImportant && "font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}


