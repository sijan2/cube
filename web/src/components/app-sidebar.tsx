"use client";

import * as React from "react";
import { RiCheckLine } from "@remixicon/react";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import { etiquettes } from "@/components/big-calendar";

import { NavUser } from "@/components/nav-user";
import { useAuth } from "@/providers/auth-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarCalendar from "@/components/sidebar-calendar";
import { Checkbox } from "@/components/ui/checkbox";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isColorVisible, toggleColorVisibility } = useCalendarContext();
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
      <SidebarContent className="gap-0 mt-3 pt-3 border-t">
        <SidebarGroup className="px-1">
          <SidebarCalendar />
        </SidebarGroup>
        <SidebarGroup className="px-1 mt-3 pt-4 border-t">
          <SidebarGroupLabel className="uppercase text-muted-foreground/65">
            Calendars
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {etiquettes.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    className="relative rounded-md [&>svg]:size-auto justify-between has-focus-visible:border-ring has-focus-visible:ring-ring/50 has-focus-visible:ring-[3px]"
                  >
                    <span>
                      <span className="font-medium flex items-center justify-between gap-3">
                        <Checkbox
                          id={item.id}
                          className="sr-only peer"
                          checked={isColorVisible(item.color)}
                          onCheckedChange={() =>
                            toggleColorVisibility(item.color)
                          }
                        />
                        <RiCheckLine
                          className="peer-not-data-[state=checked]:invisible"
                          size={16}
                          aria-hidden="true"
                        />
                        <label
                          htmlFor={item.id}
                          className="peer-not-data-[state=checked]:line-through peer-not-data-[state=checked]:text-muted-foreground/65 after:absolute after:inset-0"
                        >
                          {item.name}
                        </label>
                      </span>
                      <span
                        className="size-1.5 rounded-full bg-(--event-color)"
                        style={
                          {
                            "--event-color": `var(--color-${item.color}-400)`,
                          } as React.CSSProperties
                        }
                      ></span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
