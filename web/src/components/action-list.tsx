"use client";

import { useState } from "react";
import { RiCheckboxCircleFill, RiCheckboxBlankCircleLine } from "@remixicon/react";
import { CheckCircle2, Circle, MessageSquare, Sparkles } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

interface ActionItem {
  id: number;
  content: string;
  completed: boolean;
  category?: string;
  color?: string;
}

const mockActionItems: ActionItem[] = [
  // Top 3 Priority Actions
  { id: 1, content: "Complete 3-5 LeetCode medium/hard problems", completed: false, category: "Interview", color: "from-red-500/70 to-orange-500/70" },
  { id: 2, content: "Prepare progress report for 10 AM standup", completed: false, category: "Project", color: "from-blue-500/70 to-indigo-500/70" },
  { id: 3, content: "Confirm flight details (11:15 AM)", completed: false, category: "Travel", color: "from-green-500/70 to-emerald-500/70" },
];

export function ActionList() {
  const [items, setItems] = useState<ActionItem[]>(mockActionItems);

  const toggleItem = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAskAbout = (item: ActionItem) => {
    // Trigger chat with the action item context
    const prompt = `Help me with: ${item.content}`;
    window.dispatchEvent(new CustomEvent("floating-chat:append-message", {
      detail: { role: "user", text: prompt }
    }));
  };

  const completedCount = items.filter(item => item.completed).length;

  return (
    <SidebarGroup className="px-1 mt-3 pt-4 border-t">
      <SidebarGroupLabel className="uppercase text-muted-foreground/65 flex items-center justify-between gap-2 mb-3">
        <span>Quick Actions</span>
        <span className="text-xs normal-case text-muted-foreground/50">
          {completedCount}/3
        </span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative p-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all border border-transparent hover:border-foreground/5 overflow-hidden"
            >
              {/* Color gradient strip on left */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color || 'from-gray-500/30 to-gray-600/30'}`} />

              <div className="flex items-start gap-2.5 pl-2">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="mt-0.5 transition-all"
                  aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {item.completed ? (
                    <CheckCircle2
                      size={16}
                      className="text-muted-foreground/50"
                    />
                  ) : (
                    <Circle
                      size={16}
                      className="text-muted-foreground/30 hover:text-muted-foreground/50"
                    />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span
                        className={`text-sm leading-snug block ${
                          item.completed
                            ? "line-through text-muted-foreground/50"
                            : "text-foreground/80"
                        }`}
                      >
                        {item.content}
                      </span>
                      {item.category && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {!item.completed && (
                      <button
                        onClick={() => handleAskAbout(item)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted/50"
                        aria-label="Get AI help for this task"
                      >
                        <MessageSquare size={14} className="text-muted-foreground/70" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
