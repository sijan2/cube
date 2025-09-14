"use client";

import { useEffect, useState } from "react";
import { RiSparkling2Line, RiCloseLine } from "@remixicon/react";
import {
  Briefcase,
  Code2,
  GraduationCap,
  Plane,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { SidebarCard } from "@/components/ui/sidebar-card";
import { TagChip } from "@/components/ui/tag-chip";

interface Task {
  id: number;
  title: string;
  content: string;
  priority: "critical" | "high" | "medium";
  icon: React.ReactNode;
  deadline?: string;
  progress?: number;
  tags?: string[];
  color?: string;
}

interface Briefing {
  tasks: Task[];
  nudge?: {
    message: string;
    type: "warning" | "info" | "success";
    icon?: React.ReactNode;
  };
}

// Dynamic briefing data for the next week
const mockBriefing: Briefing = {
  tasks: [
    {
      id: 1,
      title: "Google SWE Interview",
      content: "Critical career opportunity requiring immediate preparation and focus",
      priority: "critical",
      icon: <Briefcase className="w-4 h-4" />,
      deadline: "Tomorrow, 2:00 PM",
      tags: ["Career", "Interview", "Urgent"],
      color: "from-red-500/60 to-orange-500/60"
    },
    {
      id: 2,
      title: "Project Architecture Dev",
      content: "Led by Alex Onufrak with daily standups at 10:00 AM",
      priority: "high",
      icon: <Code2 className="w-4 h-4" />,
      deadline: "Sept 15",
      progress: 25,
      tags: ["Development", "Team", "Deadline"],
      color: "from-blue-500/60 to-indigo-500/60"
    },
    {
      id: 3,
      title: "Academic Coursework",
      content: "CMSC 460/216 assignments, BMGT 289D lecture, Math problem sets",
      priority: "medium",
      icon: <GraduationCap className="w-4 h-4" />,
      deadline: "This Week",
      tags: ["CMSC 460", "CMSC 216", "BMGT 289D"],
      color: "from-green-500/60 to-emerald-500/60"
    },
  ],
  nudge: {
    message: "Flight to Washington - Monday at 11:15 AM. Remember to check in!",
    type: "warning",
    icon: <Plane className="w-4 h-4" />
  },
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-muted/40 border-border/70 hover:bg-muted/60";
      case "high":
        return "bg-muted/30 border-border/70 hover:bg-muted/50";
      case "medium":
        return "bg-muted/20 border-border/70 hover:bg-muted/40";
      default:
        return "bg-muted/20 border-border/70";
    }
  };

  const getNudgeStyles = (_type: string) => {
    return "bg-muted/30 border-border/70";
  };

  return (
    <SidebarGroup className="px-2 pt-3">
      <SidebarGroupLabel className="uppercase text-muted-foreground/70 tracking-wider flex items-center gap-2 mb-2">
        <RiSparkling2Line size={14} />
        <span>Top Priorities</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-3 px-1">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 bg-muted/30 rounded-lg"></div>
              <div className="h-20 bg-muted/30 rounded-lg"></div>
              <div className="h-20 bg-muted/30 rounded-lg"></div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          ) : briefing ? (
            <div className="space-y-3">
              {briefing.nudge && isNudgeVisible && (
                <div className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${getNudgeStyles(briefing.nudge.type)}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {briefing.nudge.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-snug text-foreground">
                      {briefing.nudge.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsNudgeVisible(false)}
                    className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-muted-foreground"
                  >
                    <RiCloseLine size={16} />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {briefing.tasks.map((task) => (
                  <SidebarCard
                    key={task.id}
                    className={`group relative p-3 transition-colors overflow-hidden ${getPriorityColor(task.priority)}`}
                    interactive
                  >
                    {/* Color gradient strip on left */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${task.color || 'from-gray-500/20 to-gray-600/20'}`} />

                    <div className="flex items-start gap-3 pl-2">
                      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                        {task.icon}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm text-foreground">
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {task.content}
                            </p>
                          </div>
                        </div>

                        {task.progress !== undefined && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-foreground">{task.progress}%</span>
                            </div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-foreground/30 transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs">
                          {task.deadline && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{task.deadline}</span>
                            </div>
                          )}
                        </div>

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tag, tagIndex) => (
                              <TagChip key={tagIndex} size="sm">
                                {tag}
                              </TagChip>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </SidebarCard>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
