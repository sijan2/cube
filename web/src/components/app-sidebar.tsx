"use client";

import * as React from "react";

import { NavUser } from "@/components/nav-user";
import { useAuth } from "@/providers/auth-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProjectOverview } from "@/components/project-overview";
import { DailyBriefing } from "@/components/daily-briefing";
import { ActionList } from "@/components/action-list";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  return (
    <Sidebar
      variant="inset"
      {...props}
      className="dark scheme-only-dark max-lg:p-3 lg:pe-1"
    >
      <SidebarHeader>
        <div className="flex justify-between items-center gap-2">
          {user && <NavUser user={user} />}
          <SidebarTrigger className="text-muted-foreground/80 hover:text-foreground/80 hover:bg-transparent!" />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <ProjectOverview />
        <DailyBriefing />
        <ActionList />
      </SidebarContent>
    </Sidebar>
  );
}
