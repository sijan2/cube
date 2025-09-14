"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Mail,
  Users,
  Search,
  Linkedin,
  Github,
  Code2,
  FileText,
  MessageSquare,
  Database,
  Sparkles,
  Brain,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingAnimationProps {
  isVisible: boolean;
  userQuery?: string;
  className?: string;
  pollingForResponse?: boolean;
  isActivelyPolling?: boolean;
}

type Phase = "intro" | "phase1" | "phase2" | "phase3";

interface ToolCall {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
  status: "pending" | "active" | "completed";
}

// Interview Ninja Tools
const INTERVIEW_TOOLS: ToolCall[] = [
  { id: "calendar", name: "Calendar MCP", icon: Calendar, description: '📅 "Google SWE Interview, Level 5, tomorrow 2-4 PM"', status: "pending" },
  { id: "gmail1", name: "Gmail MCP", icon: Mail, description: "📧 Scans interview confirmation email for interviewer names", status: "pending" },
  { id: "contacts", name: "Contacts MCP", icon: Users, description: "👥 Finds interviewer contact details", status: "pending" },
  { id: "search1", name: "Web Search MCP", icon: Search, description: '🔍 "Google latest engineering initiatives 2024"', status: "pending" },
  { id: "linkedin1", name: "LinkedIn Search MCP", icon: Linkedin, description: '🔗 Interviewer: "Sarah Kim, Staff SWE at Google Search"', status: "pending" },
  { id: "github", name: "GitHub MCP", icon: Github, description: "💻 Analyzes your recent commits, finds impressive projects", status: "pending" },
  { id: "leetcode", name: "LeetCode MCP", icon: Code2, description: '🧮 "You\'ve solved 450 problems, 85% medium/hard"', status: "pending" },
  { id: "slack", name: "Slack MCP", icon: MessageSquare, description: "💬 Recent technical discussions you've led", status: "pending" },
  { id: "notion", name: "Notion MCP", icon: FileText, description: "📝 Your personal tech notes and learning progress", status: "pending" },
];

// Study Plan Tools
const STUDY_TOOLS: ToolCall[] = [
  { id: "canvas1", name: "Canvas MCP", icon: FileText, description: "🎓 Pulls syllabus, assignments, grade distribution", status: "pending" },
  { id: "gmail", name: "Gmail MCP", icon: Mail, description: "📧 Professor emails about exam focus areas", status: "pending" },
  { id: "canvas2", name: "Canvas MCP", icon: FileText, description: '📊 Your current grades: 78% (need 85% for A)', status: "pending" },
  { id: "lica1", name: "Lica World MCP", icon: Sparkles, description: "🎨 3D Rendering Pipeline animated flowchart", status: "pending" },
  { id: "lica2", name: "Lica World MCP", icon: Sparkles, description: "🎨 Matrix Transformations step-by-step guide", status: "pending" },
  { id: "calendar", name: "Calendar MCP", icon: Calendar, description: "📅 Finds your free time slots over next 2 weeks", status: "pending" },
  { id: "supabase", name: "Supabase MCP", icon: Database, description: "📊 Creates optimized study schedule", status: "pending" },
];

export function ThinkingAnimation({ isVisible, userQuery = "", className, pollingForResponse = false, isActivelyPolling = false }: ThinkingAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>("intro");
  const [tools, setTools] = useState<ToolCall[]>([]);
  const [dots, setDots] = useState("");

  // Detect workflow type
  const workflowType = React.useMemo(() => {
    const query = userQuery.toLowerCase();
    if (query.includes('interview') || query.includes('google') || query.includes('swe') ||
        query.includes('job') || query.includes('dominate') || query.includes('ninja')) {
      return 'interview';
    } else if (query.includes('study') || query.includes('exam') || query.includes('final') ||
               query.includes('course') || query.includes('learn') || query.includes('ace')) {
      return 'study';
    }
    return 'interview'; // Default
  }, [userQuery]);

  // Initialize tools based on workflow
  React.useEffect(() => {
    setTools(workflowType === 'interview' ? INTERVIEW_TOOLS : STUDY_TOOLS);
  }, [workflowType]);

  // Dots animation
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setDots(prev => prev === "..." ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Main phase progression
  useEffect(() => {
    if (!isVisible) {
      setCurrentPhase("intro");
      return;
    }

    const phaseTimeline = [
      { phase: "intro" as const, delay: 0 },
      { phase: "phase1" as const, delay: 8000 },   // 8 seconds for intro
      { phase: "phase2" as const, delay: 20000 },  // 12 seconds for phase1
      { phase: "phase3" as const, delay: 35000 },  // 15 seconds for phase2
    ];

    const timeouts = phaseTimeline.map(({ phase, delay }) =>
      setTimeout(() => setCurrentPhase(phase), delay)
    );

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [isVisible]);

  // Tool activation for each phase
  useEffect(() => {
    if (!isVisible || currentPhase === "intro") return;

    const getToolsForPhase = (phase: Phase) => {
      if (workflowType === 'interview') {
        switch (phase) {
          case "phase1": return tools.slice(0, 4); // First 4 tools
          case "phase2": return tools.slice(4, 7); // Next 3 tools
          case "phase3": return tools.slice(7, 9); // Last 2 tools
          default: return [];
        }
      } else {
        switch (phase) {
          case "phase1": return tools.slice(0, 3); // First 3 tools
          case "phase2": return tools.slice(3, 5); // Next 2 tools
          case "phase3": return tools.slice(5, 7); // Last 2 tools
          default: return [];
        }
      }
    };

    const phaseTools = getToolsForPhase(currentPhase);

    // Reset all tools to pending first
    setTools(prev => prev.map(tool => ({ ...tool, status: "pending" as const })));

    // Activate tools for current phase
    const activationTimeouts = phaseTools.map((tool, index) => {
      const activateTimeout = setTimeout(() => {
        setTools(prev => prev.map(t =>
          t.id === tool.id ? { ...t, status: "active" as const } : t
        ));

        // Complete after 2-4 seconds
        const completeTimeout = setTimeout(() => {
          setTools(prev => prev.map(t =>
            t.id === tool.id ? { ...t, status: "completed" as const } : t
          ));
        }, 2000 + Math.random() * 2000);

        return completeTimeout;
      }, index * 800 + Math.random() * 500);

      return activateTimeout;
    });

    return () => activationTimeouts.forEach(timeout => clearTimeout(timeout));
  }, [currentPhase, isVisible, workflowType, tools.length]);

  if (!isVisible) return null;

  const getPhaseInfo = () => {
    const isInterview = workflowType === 'interview';

    switch (currentPhase) {
      case "intro":
        return {
          icon: Brain,
          text: isInterview ? "🎯 Interview Ninja Mode Activated" : "📚 Study Plan Genius Activated",
          subtitle: "Working with your personal AI assistant",
          color: "text-purple-600 dark:text-purple-400"
        };
      case "phase1":
        return {
          icon: Search,
          text: isInterview ? "📊 Phase 1: Intelligence Gathering" : "🎓 Phase 1: Academic Intelligence",
          subtitle: isInterview ? "Extracting interview details and company research" : "Course analysis and knowledge gap assessment",
          color: "text-blue-600 dark:text-blue-400"
        };
      case "phase2":
        return {
          icon: Zap,
          text: isInterview ? "💻 Phase 2: Contextual Analysis" : "🧠 Phase 2: Study Plan Creation",
          subtitle: isInterview ? "Technical preparation and competitive positioning" : "Visual materials and intelligent scheduling",
          color: "text-yellow-600 dark:text-yellow-400"
        };
      case "phase3":
        return {
          icon: Sparkles,
          text: isInterview ? "🎨 Phase 3: Content Creation" : "📝 Phase 3: Platform Organization",
          subtitle: isInterview ? "Visual portfolio and strategic brief generation" : "Workspace setup and smart reminders",
          color: "text-green-600 dark:text-green-400"
        };
      default:
        return {
          icon: Brain,
          text: "🤖 AI Assistant",
          subtitle: "Processing...",
          color: "text-gray-600 dark:text-gray-400"
        };
    }
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;
  const activeTools = tools.filter(tool => tool.status !== "pending");

  return (
    <AnimatePresence>
      <motion.div
        key="thinking-animation"
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl backdrop-saturate-150",
          "dark:border-white/10 dark:bg-white/5 dark:shadow-2xl",
          className
        )}
      >
        {/* Main Phase Indicator */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={cn(
              "rounded-full p-2",
              phaseInfo.color.replace("text-", "bg-").replace("600", "100").replace("400", "900/20")
            )}
          >
            <PhaseIcon size={20} className={phaseInfo.color} />
          </motion.div>
          <div className="flex flex-col">
            <span className={cn("text-sm font-medium", phaseInfo.color)}>
              {phaseInfo.text}{dots}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {phaseInfo.subtitle}
            </span>
          </div>
        </div>

        {/* Active Tools */}
        {activeTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-2"
          >
            <div className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              Active MCP Connections:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {activeTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all",
                      tool.status === "active" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                      tool.status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    )}
                  >
                    <motion.div
                      animate={tool.status === "active" ? { rotate: 360 } : {}}
                      transition={{
                        duration: 1,
                        repeat: tool.status === "active" ? Infinity : 0,
                        ease: "linear"
                      }}
                    >
                      <Icon size={14} />
                    </motion.div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-xs">{tool.name}</span>
                      <span className="text-xs opacity-80 truncate">{tool.description}</span>
                    </div>
                    {tool.status === "completed" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-green-600 dark:text-green-400"
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Phase 3 Final Processing */}
        {currentPhase === "phase3" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300"
          >
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-current"
                />
              ))}
            </div>
            <span>
              {workflowType === 'interview'
                ? "🚀 Generating your interview domination strategy..."
                : "📊 Setting up your complete study ecosystem..."
              }
            </span>
          </motion.div>
        )}

        {/* Polling Status - shown when polling for response */}
        {pollingForResponse && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: currentPhase === "phase3" ? 25 : 0 }} // Show after 25 seconds in phase3 (closer to 60 second mark)
            className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-3 w-3 border-2 border-current border-t-transparent rounded-full"
            />
            <span>
              {currentPhase === "intro" || currentPhase === "phase1" || currentPhase === "phase2"
                ? "🔄 Processing your request through mcp² services..."
                : isActivelyPolling
                  ? "🔄 Actively checking for response every 5 seconds..."
                  : "⏳ Will start checking for response after 60 seconds..."
              }
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}