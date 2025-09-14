"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SidebarCardProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function SidebarCard({ className, interactive = false, ...props }: SidebarCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-md border border-border/70 bg-muted/20",
        interactive && "hover:bg-muted/30 transition-colors cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}


