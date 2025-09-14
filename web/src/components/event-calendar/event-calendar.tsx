"use client";

import { useEffect, useMemo, useState } from "react";
import { useCalendarContext } from "./calendar-context";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  addHoursToDate,
  AgendaDaysToShow,
  AgendaView,
  CalendarDndProvider,
  DayView,
  EventGap,
  EventHeight,
  MonthView,
  WeekCellsHeight,
  WeekView,
} from "@/components/event-calendar";
import type { CalendarEvent, CalendarView } from "@/components/event-calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { MessageSquare } from "lucide-react";
import Participants from "@/components/participants";

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  className?: string;
  initialView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  onDateChange?: (date: Date) => void;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "month",
  onViewChange,
  onDateChange,
}: EventCalendarProps) {
  // Use the shared calendar context instead of local state
  const { currentDate, setCurrentDate } = useCalendarContext();
  const [view, setView] = useState<CalendarView>(initialView);
  // Removed EventDialog usage; keep UI simple and use floating chat panel instead
  const { open } = useSidebar();

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("month");
          onViewChange?.("month");
          break;
        case "w":
          setView("week");
          onViewChange?.("week");
          break;
        case "d":
          setView("day");
          onViewChange?.("day");
          break;
        case "a":
          setView("agenda");
          onViewChange?.("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handlePrevious = () => {
    let newDate: Date;
    if (view === "month") {
      newDate = subMonths(currentDate, 1);
    } else if (view === "week") {
      newDate = subWeeks(currentDate, 1);
    } else if (view === "day") {
      newDate = addDays(currentDate, -1);
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      newDate = addDays(currentDate, -AgendaDaysToShow);
    } else {
      newDate = currentDate;
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    if (view === "month") {
      newDate = addMonths(currentDate, 1);
    } else if (view === "week") {
      newDate = addWeeks(currentDate, 1);
    } else if (view === "day") {
      newDate = addDays(currentDate, 1);
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      newDate = addDays(currentDate, AgendaDaysToShow);
    } else {
      newDate = currentDate;
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    console.log("Event selected:", event); // Debug log
    // Dispatch to floating chat to open the lightweight panel instead of dialog
    window.dispatchEvent(
      new CustomEvent("floating-chat:open-panel", { detail: { event } }),
    );
  };

  const handleEventCreate = (startTime: Date) => {
    console.log("Creating new event at:", startTime); // Debug log

    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder);
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder));
      }
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
    }

    // Instead of opening the dialog, open the floating chat panel with context
    const newEvent: CalendarEvent = {
      id: "",
      title: "New event",
      start: startTime,
      end: addHoursToDate(startTime, 1),
      allDay: false,
    };
    window.dispatchEvent(
      new CustomEvent("floating-chat:open-panel", { detail: { event: newEvent } }),
    );
  };

  const handleEventSave = (event: CalendarEvent) => {
    if (event.id) {
      onEventUpdate?.(event);
      toast(`Event "${event.title}" updated`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    } else {
      onEventAdd?.({
        ...event,
        id: Math.random().toString(36).substring(2, 11),
      });
      toast(`Event "${event.title}" added`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    }
  };

  const handleEventDelete = (eventId: string) => {
    const deletedEvent = events.find((e) => e.id === eventId);
    onEventDelete?.(eventId);

    // Show toast notification when an event is deleted
    if (deletedEvent) {
      toast(`Event "${deletedEvent.title}" deleted`, {
        description: format(new Date(deletedEvent.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    }
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent);

    // Show toast notification when an event is updated via drag and drop
    toast(`Event "${updatedEvent.title}" moved`, {
      description: format(new Date(updatedEvent.start), "MMM d, yyyy"),
      position: "bottom-left",
    });
  };

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
      }
    } else if (view === "day") {
      return (
        <>
          <span className="min-sm:hidden" aria-hidden="true">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span className="max-sm:hidden min-md:hidden" aria-hidden="true">
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEE MMMM d, yyyy")}
          </span>
        </>
      );
    } else if (view === "agenda") {
      // Show the month range for agenda view
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
      }
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  }, [currentDate, view]);

  return (
    <div
      className="flex has-data-[slot=month-view]:flex-1 flex-col rounded-lg h-full overflow-hidden"
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-5 sm:px-4",
            className,
          )}
        >
          <div className="flex sm:flex-col max-sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <SidebarTrigger
                data-state={open ? "invisible" : "visible"}
                className="peer size-7 text-muted-foreground/80 hover:text-foreground/80 hover:bg-transparent! sm:-ms-1.5 lg:data-[state=invisible]:opacity-0 lg:data-[state=invisible]:pointer-events-none transition-opacity ease-in-out duration-200"
                isOutsideSidebar
              />
              <h2 className="font-semibold text-xl lg:peer-data-[state=invisible]:-translate-x-7.5 transition-transform ease-in-out duration-300">
                {viewTitle}
              </h2>
            </div>
            <Participants />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center sm:gap-2 max-sm:order-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="max-sm:size-8"
                  onClick={handlePrevious}
                  aria-label="Previous"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="max-sm:size-8"
                  onClick={handleNext}
                  aria-label="Next"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </div>
              <Button
                className="max-sm:h-8 max-sm:px-2.5!"
                onClick={handleToday}
              >
                Today
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                className="max-sm:h-8 max-sm:px-2.5!"
                onClick={() => {
                  const now = new Date();
                  const newEvent: CalendarEvent = {
                    id: "",
                    title: "New event",
                    start: now,
                    end: addHoursToDate(now, 1),
                    allDay: false,
                  };
                  window.dispatchEvent(
                    new CustomEvent("floating-chat:open-panel", { detail: { event: newEvent } }),
                  );
                }}
              >
                New Event
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-1.5 max-sm:h-8 max-sm:px-2! max-sm:gap-1"
                  >
                    <span className="capitalize">{view}</span>
                    <ChevronDownIcon
                      className="-me-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-32">
                  <DropdownMenuItem onClick={() => { setView("month"); onViewChange?.("month"); }}>
                    Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setView("week"); onViewChange?.("week"); }}>
                    Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setView("day"); onViewChange?.("day"); }}>
                    Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setView("agenda"); onViewChange?.("agenda"); }}>
                    Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>

        {/* EventDialog removed intentionally */}
      </CalendarDndProvider>
    </div>
  );
}
