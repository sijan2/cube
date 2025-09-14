"use client";

import { useState } from "react";
import { RiCheckboxCircleFill, RiCheckboxBlankCircleLine } from "@remixicon/react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

interface ActionItem {
  id: number;
  content: string;
  completed: boolean;
}

const mockActionItems: ActionItem[] = [
  { id: 1, content: "Review the design mockups", completed: false },
  { id: 2, content: "Follow up with the marketing team", completed: true },
  { id: 3, content: "Draft the project proposal", completed: false },
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

  return (
    <SidebarGroup className="px-1 mt-3 pt-4 border-t">
      <SidebarGroupLabel className="uppercase text-muted-foreground/65 flex items-center gap-2 mb-2">
        <span>Action List</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {item.completed ? (
                <RiCheckboxCircleFill
                  size={18}
                  className="text-primary/70 group-hover:text-primary transition-colors"
                />
              ) : (
                <RiCheckboxBlankCircleLine
                  size={18}
                  className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
                />
              )}
              <span
                className={`font-medium text-foreground/90 leading-snug transition-colors ${
                  item.completed
                    ? "line-through text-muted-foreground/60"
                    : "group-hover:text-foreground"
                }`}
              >
                {item.content}
              </span>
            </li>
          ))}
        </ul>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
