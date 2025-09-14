"use client";

import { useState } from "react";
import {
  Sparkles,
  Brain,
  Code,
  Calendar,
  Mail,
  Github,
  Linkedin,
  Database,
  ChevronRight,
  FileText,
  Search,
  MessageSquare,
  Users
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function ProjectOverview() {
  const [expanded, setExpanded] = useState(false);

  const integrations = [
    { icon: <Calendar className="w-3 h-3" />, name: "Calendar", color: "text-blue-500" },
    { icon: <Mail className="w-3 h-3" />, name: "Gmail", color: "text-red-500" },
    { icon: <Github className="w-3 h-3" />, name: "GitHub", color: "text-gray-600" },
    { icon: <Linkedin className="w-3 h-3" />, name: "LinkedIn", color: "text-blue-600" },
    { icon: <FileText className="w-3 h-3" />, name: "Notion", color: "text-black" },
    { icon: <Code className="w-3 h-3" />, name: "Linear", color: "text-purple-500" },
    { icon: <Search className="w-3 h-3" />, name: "Web Search", color: "text-green-500" },
    { icon: <Code className="w-3 h-3" />, name: "LeetCode", color: "text-orange-500" },
    { icon: <Database className="w-3 h-3" />, name: "Supabase", color: "text-green-600" },
    { icon: <MessageSquare className="w-3 h-3" />, name: "Slack", color: "text-purple-600" },
    { icon: <Sparkles className="w-3 h-3" />, name: "Lica World", color: "text-pink-500" },
    { icon: <Users className="w-3 h-3" />, name: "Contacts", color: "text-indigo-500" },
  ];

  return (
    <SidebarGroup className="px-1 pt-4 pb-2">
      <SidebarGroupLabel className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 uppercase text-muted-foreground/65">
          <div className="relative">
            <Brain className="w-4 h-4" />
            <Sparkles className="w-2 h-2 absolute -top-1 -right-1 text-yellow-500" />
          </div>
          <span>mcp² AI Assistant</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground/50 hover:text-muted-foreground transition-all"
        >
          <ChevronRight
            size={14}
            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </button>
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <div className="space-y-3">
          {/* Project Tagline */}
          <div className="p-2 rounded-lg bg-muted/10 border border-foreground/5">
            <p className="text-[11px] text-muted-foreground text-center italic">
              "Your personal AI that actually knows you"
            </p>
          </div>

          {/* Integrations Grid - Show when expanded */}
          {expanded && (
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                Active Integrations ({integrations.length})
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {integrations.map((integration, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 p-1.5 rounded bg-muted/10 hover:bg-muted/20 transition-all relative overflow-hidden"
                  >
                    {/* Small color indicator dot */}
                    <div className={`w-1.5 h-1.5 rounded-full ${integration.color.replace('text-', 'bg-')}`}></div>
                    <div className={`${integration.color} opacity-80`}>{integration.icon}</div>
                    <span className="text-[10px] text-muted-foreground truncate">{integration.name}</span>
                  </div>
                ))}
              </div>

              {/* Integration status summary */}
              <div className="pt-1 border-t border-muted/20">
                <div className="text-[9px] text-muted-foreground/60 text-center">
                  All services connected • Real-time sync enabled
                </div>
              </div>
            </div>
          )}

        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}