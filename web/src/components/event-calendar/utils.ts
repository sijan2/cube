import { isSameDay } from "date-fns";

import type { CalendarEvent, EventColor } from "@/components/event-calendar";

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color?: EventColor | string): string {
  const eventColor = color || "sky";

  switch (eventColor) {
    case "sky":
      return "bg-sky-100 hover:bg-sky-200 text-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 dark:text-sky-50 border border-sky-300 dark:border-sky-500";
    case "blue":
      return "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-blue-50 border border-blue-300 dark:border-blue-500";
    case "indigo":
      return "bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-indigo-50 border border-indigo-300 dark:border-indigo-500";
    case "violet":
      return "bg-violet-100 hover:bg-violet-200 text-violet-800 dark:bg-violet-600 dark:hover:bg-violet-500 dark:text-violet-50 border border-violet-300 dark:border-violet-500";
    case "purple":
      return "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 dark:text-purple-50 border border-purple-300 dark:border-purple-500";
    case "pink":
      return "bg-pink-100 hover:bg-pink-200 text-pink-800 dark:bg-pink-600 dark:hover:bg-pink-500 dark:text-pink-50 border border-pink-300 dark:border-pink-500";
    case "rose":
      return "bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 dark:text-rose-50 border border-rose-300 dark:border-rose-500";
    case "red":
      return "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-600 dark:hover:bg-red-500 dark:text-red-50 border border-red-300 dark:border-red-500";
    case "orange":
      return "bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-600 dark:hover:bg-orange-500 dark:text-orange-50 border border-orange-300 dark:border-orange-500";
    case "yellow":
      return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:text-yellow-50 border border-yellow-300 dark:border-yellow-500";
    case "green":
      return "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-600 dark:hover:bg-green-500 dark:text-green-50 border border-green-300 dark:border-green-500";
    case "emerald":
      return "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-emerald-50 border border-emerald-300 dark:border-emerald-500";
    case "teal":
      return "bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-teal-50 border border-teal-300 dark:border-teal-500";
    case "cyan":
      return "bg-cyan-100 hover:bg-cyan-200 text-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 dark:text-cyan-50 border border-cyan-300 dark:border-cyan-500";
    default:
      return "bg-sky-100 hover:bg-sky-200 text-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 dark:text-sky-50 border border-sky-300 dark:border-sky-500";
  }
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(
  isFirstDay: boolean,
  isLastDay: boolean,
): string {
  if (isFirstDay && isLastDay) {
    return "rounded"; // Both ends rounded
  } else if (isFirstDay) {
    return "rounded-l rounded-r-none not-in-data-[slot=popover-content]:w-[calc(100%+5px)]"; // Only left end rounded
  } else if (isLastDay) {
    return "rounded-r rounded-l-none not-in-data-[slot=popover-content]:w-[calc(100%+4px)] not-in-data-[slot=popover-content]:-translate-x-[4px]"; // Only right end rounded
  } else {
    return "rounded-none not-in-data-[slot=popover-content]:w-[calc(100%+9px)] not-in-data-[slot=popover-content]:-translate-x-[4px]"; // No rounded corners
  }
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      return isSameDay(day, eventStart);
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Only include if it's not the start day but is either the end day or a middle day
    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (day > eventStart && day < eventEnd)
    );
  });
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) ||
        (day > eventStart && day < eventEnd)
      );
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Auto-assign colors to events based on title keywords and patterns
 */
export function getSmartEventColor(title: string, description?: string): EventColor {
  const text = `${title.toLowerCase()} ${(description || '').toLowerCase()}`;

  // Meeting/Work related
  if (text.includes('meeting') || text.includes('standup') || text.includes('sync') ||
      text.includes('interview') || text.includes('call') || text.includes('presentation')) {
    return 'blue';
  }

  // Personal/Life events
  if (text.includes('birthday') || text.includes('anniversary') || text.includes('party') ||
      text.includes('celebration') || text.includes('wedding')) {
    return 'pink';
  }

  // Health/Medical
  if (text.includes('doctor') || text.includes('appointment') || text.includes('medical') ||
      text.includes('checkup') || text.includes('dentist') || text.includes('therapy')) {
    return 'red';
  }

  // Travel
  if (text.includes('flight') || text.includes('travel') || text.includes('vacation') ||
      text.includes('trip') || text.includes('hotel') || text.includes('airport')) {
    return 'cyan';
  }

  // Education/Learning
  if (text.includes('class') || text.includes('course') || text.includes('workshop') ||
      text.includes('training') || text.includes('seminar') || text.includes('lecture')) {
    return 'purple';
  }

  // Food/Social
  if (text.includes('lunch') || text.includes('dinner') || text.includes('coffee') ||
      text.includes('breakfast') || text.includes('meal') || text.includes('restaurant')) {
    return 'orange';
  }

  // Sports/Fitness
  if (text.includes('gym') || text.includes('workout') || text.includes('exercise') ||
      text.includes('yoga') || text.includes('run') || text.includes('sports')) {
    return 'green';
  }

  // Entertainment
  if (text.includes('movie') || text.includes('concert') || text.includes('show') ||
      text.includes('theater') || text.includes('game') || text.includes('entertainment')) {
    return 'violet';
  }

  // Shopping/Errands
  if (text.includes('shopping') || text.includes('grocery') || text.includes('errands') ||
      text.includes('bank') || text.includes('post office') || text.includes('store')) {
    return 'teal';
  }

  // Deadlines/Important
  if (text.includes('deadline') || text.includes('due') || text.includes('urgent') ||
      text.includes('important') || text.includes('critical') || text.includes('review')) {
    return 'rose';
  }

  // Default fallback - use a rotating color based on title hash
  const colors: EventColor[] = ['sky', 'indigo', 'emerald', 'yellow'];
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Color palette for random assignment
 */
export const EVENT_COLOR_PALETTE: EventColor[] = [
  'blue', 'sky', 'indigo', 'violet', 'purple', 'pink',
  'rose', 'red', 'orange', 'yellow', 'green', 'emerald', 'teal', 'cyan'
];
