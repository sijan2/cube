"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TagChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: "sm" | "md";
};

export function TagChip({ className, size = "sm", ...props }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-block rounded bg-muted text-muted-foreground",
        size === "sm" && "px-1.5 py-0.5 text-[10px] font-medium",
        size === "md" && "px-2 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}


