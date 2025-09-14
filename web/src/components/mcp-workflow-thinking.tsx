"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Mail,
  Linkedin,
  Github,
  Code,
  MessageSquare,
  Search,
  Sparkles,
  FileText,
  Database,
  CheckCircle,
  Clock,
  Brain,
  Loader2
} from "lucide-react";

const mcpWorkflowSteps = [
  {
    id: 1,
    title: "Calendar Intelligence",
    description: "Extracting interview details and scheduling",
    icon: <Calendar className="w-4 h-4" />,
    service: "Calendar MCP",
    duration: 5000
  },
  {
    id: 2,
    title: "Email Analysis",
    description: "Scanning Gmail for interview confirmations",
    icon: <Mail className="w-4 h-4" />,
    service: "Gmail MCP",
    duration: 4000
  },
  {
    id: 3,
    title: "Interviewer Research",
    description: "Finding LinkedIn profiles and backgrounds",
    icon: <Linkedin className="w-4 h-4" />,
    service: "LinkedIn MCP",
    duration: 6000
  },
  {
    id: 4,
    title: "GitHub Analysis",
    description: "Analyzing impressive projects and commits",
    icon: <Github className="w-4 h-4" />,
    service: "GitHub MCP",
    duration: 5500
  },
  {
    id: 5,
    title: "LeetCode Review",
    description: "Recommending practice problems",
    icon: <Code className="w-4 h-4" />,
    service: "LeetCode MCP",
    duration: 4500
  },
  {
    id: 6,
    title: "Team Communications",
    description: "Checking Slack and Linear for leadership examples",
    icon: <MessageSquare className="w-4 h-4" />,
    service: "Slack MCP",
    duration: 5000
  },
  {
    id: 7,
    title: "Industry Research",
    description: "Latest Google engineering initiatives",
    icon: <Search className="w-4 h-4" />,
    service: "Web Search MCP",
    duration: 6500
  },
  {
    id: 8,
    title: "Visual Content Creation",
    description: "Generating diagrams and infographics",
    icon: <Sparkles className="w-4 h-4" />,
    service: "Lica World MCP",
    duration: 8000
  },
  {
    id: 9,
    title: "Interview Brief",
    description: "Creating comprehensive prep guide",
    icon: <FileText className="w-4 h-4" />,
    service: "Notion MCP",
    duration: 7000
  },
  {
    id: 10,
    title: "Data Storage",
    description: "Storing Intelligence Package",
    icon: <Database className="w-4 h-4" />,
    service: "Supabase MCP",
    duration: 3000
  }
];

interface MCPWorkflowThinkingProps {
  className?: string;
}

export function MCPWorkflowThinking({ className }: MCPWorkflowThinkingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    setStartTime(Date.now());
    setCurrentStep(0);
    setCompletedSteps([]);

    let stepIndex = 0;
    const processNextStep = () => {
      if (stepIndex < mcpWorkflowSteps.length) {
        setCurrentStep(stepIndex);

        setTimeout(() => {
          setCompletedSteps(prev => [...prev, stepIndex]);
          stepIndex++;

          if (stepIndex < mcpWorkflowSteps.length) {
            // Small delay between steps
            setTimeout(processNextStep, 500);
          }
        }, mcpWorkflowSteps[stepIndex].duration);
      }
    };

    // Start the workflow
    const initialDelay = setTimeout(processNextStep, 1000);

    return () => {
      clearTimeout(initialDelay);
    };
  }, []);

  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-5 h-5 text-blue-400" />
        </motion.div>
        <div>
          <h3 className="text-sm font-medium text-zinc-100">mcp² Intelligence Gathering</h3>
          <p className="text-xs text-zinc-400">Processing across {mcpWorkflowSteps.length} services • {elapsedTime}s elapsed</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
        {mcpWorkflowSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index && !isCompleted;
          const isPending = index > currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all",
                isCompleted && "bg-green-900/20 border border-green-800/30",
                isCurrent && "bg-blue-900/20 border border-blue-800/30",
                isPending && "bg-zinc-900/50 border border-zinc-800/30"
              )}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-4 h-4 text-blue-400" />
                  </motion.div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-zinc-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium",
                    isCompleted ? "text-green-400" : isCurrent ? "text-blue-400" : "text-zinc-500"
                  )}>
                    {step.title}
                  </span>
                  <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                    {step.service}
                  </span>
                </div>
                <p className={cn(
                  "text-xs",
                  isCompleted ? "text-zinc-300" : isCurrent ? "text-zinc-400" : "text-zinc-500"
                )}>
                  {step.description}
                </p>
              </div>

              <div className="flex-shrink-0 text-zinc-500">
                {step.icon}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="pt-2 border-t border-zinc-800">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>Overall Progress</span>
          <span>{completedSteps.length}/{mcpWorkflowSteps.length}</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedSteps.length / mcpWorkflowSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
}