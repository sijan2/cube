"use client";

import { useEffect, useState } from "react";
import { RiSparkling2Line, RiCloseLine } from "@remixicon/react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

interface Task {
  id: number;
  content: string;
}

interface Briefing {
  tasks: Task[];
  nudge?: string;
}

// Mock data for daily briefing
const mockBriefing: Briefing = {
  tasks: [
    { id: 1, content: "Finalize Q3 report and send for review" },
    { id: 2, content: "Prepare for the upcoming client presentation" },
    { id: 3, content: "Review and merge the latest pull requests" },
  ],
  nudge: "Don't forget to prepare for your next Midterm!",
};

// Simulate an API call
const fetchBriefing = (): Promise<Briefing> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBriefing);
    }, 1500); // Simulate network delay
  });
};

export function DailyBriefing() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNudgeVisible, setIsNudgeVisible] = useState(true);

  useEffect(() => {
    const getBriefing = async () => {
      try {
        setIsLoading(true);
        const data = await fetchBriefing();
        setBriefing(data);
      } catch (err) {
        setError("Failed to fetch briefing.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getBriefing();
  }, []);

  return (
    <SidebarGroup className="px-1 mt-3 pt-4 border-t">
      <SidebarGroupLabel className="uppercase text-muted-foreground/65 flex items-center gap-2 mb-2">
        <RiSparkling2Line size={14} />
        <span>Top 3 Priorities</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="text-sm text-muted-foreground space-y-3 px-2 py-1">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-muted/50 rounded w-full"></div>
              <div className="h-4 bg-muted/50 rounded w-full"></div>
              <div className="h-4 bg-muted/50 rounded w-4/5"></div>
            </div>
          ) : error ? (
            <p className="text-destructive-foreground/80 text-sm">{error}</p>
          ) : briefing ? (
            <div className="space-y-3">
              {briefing.nudge && isNudgeVisible && (
                <div className="flex items-start justify-between p-2.5 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground/90 leading-snug pr-2">
                    {briefing.nudge}
                  </p>
                  <button
                    onClick={() => setIsNudgeVisible(false)}
                    className="text-muted-foreground/60 hover:text-muted-foreground transition-colors flex-shrink-0"
                  >
                    <RiCloseLine size={16} />
                  </button>
                </div>
              )}
              <ul className="space-y-2.5">
                {briefing.tasks.map((task, index) => (
                  <li key={task.id} className="flex items-start gap-3">
                    <div className="font-mono text-xs text-muted-foreground/80 pt-1">
                      {index + 1}.
                    </div>
                    <div className="font-medium text-foreground/90 leading-snug">
                      {task.content}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
