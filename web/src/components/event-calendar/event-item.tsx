"use client";

import { useMemo, useRef } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { differenceInMinutes, format, getMinutes, isPast } from "date-fns";

import {
  getBorderRadiusClasses,
  getEventColorClasses,
  type CalendarEvent,
} from "@/components/event-calendar";
import { cn } from "@/lib/utils";
import { SparklesIcon, type SparklesIconHandle } from "@/components/SparklesIcon";

// Using date-fns format with custom formatting:
// 'h' - hours (1-12)
// 'a' - am/pm
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
const formatTimeWithOptionalMinutes = (date: Date) => {
  return format(date, getMinutes(date) === 0 ? "ha" : "h:mma").toLowerCase();
};

interface EventWrapperProps {
  event: CalendarEvent;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  currentTime?: Date;
  dndListeners?: SyntheticListenerMap;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
  onMouseEnter,
  onMouseLeave,
}: EventWrapperProps) {
  // Always use the currentTime (if provided) to determine if the event is in the past
  const displayEnd = currentTime
    ? new Date(
        new Date(currentTime).getTime() +
          (new Date(event.end).getTime() - new Date(event.start).getTime()),
      )
    : new Date(event.end);

  const isEventInPast = isPast(displayEnd);

  return (
    <button
      data-calendar-event="true"
      className={cn(
        "group focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full overflow-hidden px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
        getEventColorClasses(event.color),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        className,
      )}
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      {children}
    </button>
  );
}

interface EventItemProps {
  event: CalendarEvent;
  view: "month" | "week" | "day" | "agenda";
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
  currentTime?: Date; // For updating time during drag
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
  dndListeners?: SyntheticListenerMap;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventItemProps) {
  const eventColor = event.color;
  const sparklesRef = useRef<SparklesIconHandle | null>(null);

  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = useMemo(() => {
    return currentTime || new Date(event.start);
  }, [currentTime, event.start]);

  const displayEnd = useMemo(() => {
    return currentTime
      ? new Date(
          new Date(currentTime).getTime() +
            (new Date(event.end).getTime() - new Date(event.start).getTime()),
        )
      : new Date(event.end);
  }, [currentTime, event.start, event.end]);

  // Calculate event duration in minutes
  const durationMinutes = useMemo(() => {
    return differenceInMinutes(displayEnd, displayStart);
  }, [displayStart, displayEnd]);

  const getEventTime = () => {
    if (event.allDay) return "All day";

    // For short events (less than 45 minutes), only show start time
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart);
    }

    // For longer events, show both start and end time
    return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
  };

  if (view === "month") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-[13px]",
          className,
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseEnter={() => sparklesRef.current?.startAnimation()}
        onMouseLeave={() => sparklesRef.current?.stopAnimation()}
      >
        {children || (
          <div className="flex w-full items-center justify-between gap-1">
            <span className="truncate">
              {!event.allDay && (
                <span className="truncate sm:text-xs font-normal opacity-70 uppercase">
                  {formatTimeWithOptionalMinutes(displayStart)}{" "}
                </span>
              )}
              {event.title}
            </span>
            <SparklesIcon
              ref={sparklesRef}
              className="shrink-0 opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none"
              size={12}
            />
          </div>
        )}
      </EventWrapper>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "py-1",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-[13px]" : "text-[13px]",
          className,
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseEnter={() => sparklesRef.current?.startAnimation()}
        onMouseLeave={() => sparklesRef.current?.stopAnimation()}
      >
        {durationMinutes < 45 ? (
          <div className="flex w-full items-center justify-between gap-1">
            <div className="truncate">
              {event.title}{" "}
              {showTime && (
                <span className="opacity-70">
                  {formatTimeWithOptionalMinutes(displayStart)}
                </span>
              )}
            </div>
            <SparklesIcon
              ref={sparklesRef}
              className="shrink-0 opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none"
              size={12}
            />
          </div>
        ) : (
          <>
            <div className="flex w-full items-center justify-between gap-1">
              <div className="truncate font-medium">{event.title}</div>
              <SparklesIcon
                ref={sparklesRef}
                className="shrink-0 opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none"
                size={12}
              />
            </div>
            {showTime && (
              <div className="truncate font-normal opacity-70 sm:text-xs uppercase">
                {getEventTime()}
              </div>
            )}
          </>
        )}
      </EventWrapper>
    );
  }

  // Agenda view - kept separate since it's significantly different
  return (
    <button
      data-calendar-event="true"
      className={cn(
        "group focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded p-2 text-left transition outline-none focus-visible:ring-[3px] data-past-event:line-through data-past-event:opacity-90",
        getEventColorClasses(eventColor),
        className,
      )}
      data-past-event={isPast(new Date(event.end)) || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => sparklesRef.current?.startAnimation()}
      onMouseLeave={() => sparklesRef.current?.stopAnimation()}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      <div className="flex w-full items-center justify-between">
        <div className="text-sm font-medium truncate">{event.title}</div>
        <SparklesIcon
          ref={sparklesRef}
          className="shrink-0 opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none"
          size={14}
        />
      </div>
      <div className="text-xs opacity-70">
        {event.allDay ? (
          <span>All day</span>
        ) : (
          <span className="uppercase">
            {formatTimeWithOptionalMinutes(displayStart)} -{" "}
            {formatTimeWithOptionalMinutes(displayEnd)}
          </span>
        )}
        {event.location && (
          <>
            <span className="px-1 opacity-35"> · </span>
            <span>{event.location}</span>
          </>
        )}
      </div>
      {event.description && (
        <div className="my-1 text-xs opacity-90">{event.description}</div>
      )}
    </button>
  );
}
