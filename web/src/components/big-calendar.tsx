"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, setHours, setMinutes, getDay } from "date-fns";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import { trpc } from "@/lib/trpc";

import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";

// API event shape from server (typed, simplified)
export interface ApiCalendarEvent {
  id: string;
  title?: string;
  description?: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay?: boolean;
  location?: string;
}

// Etiquettes data for calendar filtering
export const etiquettes = [
  {
    id: "my-events",
    name: "My Events",
    color: "emerald" as EventColor,
    isActive: true,
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    color: "orange" as EventColor,
    isActive: true,
  },
  {
    id: "interviews",
    name: "Interviews",
    color: "violet" as EventColor,
    isActive: true,
  },
  {
    id: "events-planning",
    name: "Events Planning",
    color: "blue" as EventColor,
    isActive: true,
  },
  {
    id: "holidays",
    name: "Holidays",
    color: "rose" as EventColor,
    isActive: true,
  },
];

// Function to calculate days until next Sunday
const getDaysUntilNextSunday = (date: Date) => {
  const day = getDay(date); // 0 is Sunday, 6 is Saturday
  return day === 0 ? 0 : 7 - day; // If today is Sunday, return 0, otherwise calculate days until Sunday
};

// Store the current date to avoid repeated new Date() calls
const currentDate = new Date();

// Calculate the offset once to avoid repeated calculations
const daysUntilNextSunday = getDaysUntilNextSunday(currentDate);

// Sample events data with hardcoded times (fallback if API fails)
const sampleEvents: CalendarEvent[] = [
  {
    id: "w1-0a",
    title: "Executive Board Meeting",
    description: "Quarterly review with executive team",
    start: setMinutes(
      setHours(addDays(currentDate, -13 + daysUntilNextSunday), 9),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -13 + daysUntilNextSunday), 11),
      30,
    ),
    color: "blue",
    location: "Executive Boardroom",
  },
  {
    id: "w1-0b",
    title: "Investor Call",
    description: "Update investors on company progress",
    start: setMinutes(
      setHours(addDays(currentDate, -13 + daysUntilNextSunday), 14),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -13 + daysUntilNextSunday), 15),
      0,
    ),
    color: "violet",
    location: "Conference Room A",
  },
  {
    id: "w1-1",
    title: "Strategy Workshop",
    description: "Annual strategy planning session",
    start: setMinutes(
      setHours(addDays(currentDate, -12 + daysUntilNextSunday), 8),
      30,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -12 + daysUntilNextSunday), 10),
      0,
    ),
    color: "violet",
    location: "Innovation Lab",
  },
  {
    id: "w1-2",
    title: "Client Presentation",
    description: "Present quarterly results",
    start: setMinutes(
      setHours(addDays(currentDate, -12 + daysUntilNextSunday), 13),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -12 + daysUntilNextSunday), 14),
      30,
    ),
    color: "emerald",
    location: "Client HQ",
  },
  {
    id: "w1-3",
    title: "Budget Review",
    description: "Review department budgets",
    start: setMinutes(
      setHours(addDays(currentDate, -11 + daysUntilNextSunday), 9),
      15,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -11 + daysUntilNextSunday), 11),
      0,
    ),
    color: "blue",
    location: "Finance Room",
  },
  {
    id: "w1-4",
    title: "Team Lunch",
    description: "Quarterly team lunch",
    start: setMinutes(
      setHours(addDays(currentDate, -11 + daysUntilNextSunday), 12),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -11 + daysUntilNextSunday), 13),
      30,
    ),
    color: "orange",
    location: "Bistro Garden",
  },
  {
    id: "w1-5",
    title: "Project Kickoff",
    description: "Launch new marketing campaign",
    start: setMinutes(
      setHours(addDays(currentDate, -10 + daysUntilNextSunday), 10),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -10 + daysUntilNextSunday), 12),
      0,
    ),
    color: "orange",
    location: "Marketing Suite",
  },
  {
    id: "w1-6",
    title: "Interview: UX Designer",
    description: "First round interview",
    start: setMinutes(
      setHours(addDays(currentDate, -10 + daysUntilNextSunday), 14),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -10 + daysUntilNextSunday), 15),
      0,
    ),
    color: "violet",
    location: "HR Office",
  },
  {
    id: "w1-7",
    title: "Company All-Hands",
    description: "Monthly company update",
    start: setMinutes(
      setHours(addDays(currentDate, -9 + daysUntilNextSunday), 9),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -9 + daysUntilNextSunday), 10),
      30,
    ),
    color: "emerald",
    location: "Main Auditorium",
  },
  {
    id: "w1-8",
    title: "Product Demo",
    description: "Demo new features to stakeholders",
    start: setMinutes(
      setHours(addDays(currentDate, -9 + daysUntilNextSunday), 13),
      45,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -9 + daysUntilNextSunday), 15),
      0,
    ),
    color: "blue",
    location: "Demo Room",
  },
  {
    id: "w1-9",
    title: "Family Time",
    description: "Morning routine with kids",
    start: setMinutes(
      setHours(addDays(currentDate, -8 + daysUntilNextSunday), 7),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -8 + daysUntilNextSunday), 7),
      30,
    ),
    color: "rose",
  },
  {
    id: "w1-10",
    title: "Family Time",
    description: "Breakfast with family",
    start: setMinutes(
      setHours(addDays(currentDate, -8 + daysUntilNextSunday), 10),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -8 + daysUntilNextSunday), 10),
      30,
    ),
    color: "rose",
  },
  {
    id: "5e",
    title: "Family Time",
    description: "Some time to spend with family",
    start: setMinutes(
      setHours(addDays(currentDate, -7 + daysUntilNextSunday), 10),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -7 + daysUntilNextSunday), 13),
      30,
    ),
    color: "rose",
  },
  {
    id: "1b",
    title: "Meeting w/ Ely",
    description: "Strategic planning for next year",
    start: setMinutes(
      setHours(addDays(currentDate, -6 + daysUntilNextSunday), 7),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -6 + daysUntilNextSunday), 8),
      0,
    ),
    color: "orange",
    location: "Main Conference Hall",
  },
  {
    id: "1c",
    title: "Team Catch-up",
    description: "Weekly team sync",
    start: setMinutes(
      setHours(addDays(currentDate, -6 + daysUntilNextSunday), 8),
      15,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -6 + daysUntilNextSunday), 11),
      0,
    ),
    color: "blue",
    location: "Main Conference Hall",
  },
  {
    id: "1d",
    title: "Checkin w/ Pedra",
    description: "Coordinate operations",
    start: setMinutes(
      setHours(addDays(currentDate, -6 + daysUntilNextSunday), 15),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -6 + daysUntilNextSunday), 16),
      0,
    ),
    color: "blue",
    location: "Main Conference Hall",
  },
  {
    id: "1e",
    title: "Teem Intro",
    description: "Introduce team members",
    start: setMinutes(
      setHours(addDays(currentDate, -5 + daysUntilNextSunday), 8),
      15,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -5 + daysUntilNextSunday), 9),
      30,
    ),
    color: "emerald",
    location: "Main Conference Hall",
  },
  {
    id: "1f",
    title: "Task Presentation",
    description: "Present tasks",
    start: setMinutes(
      setHours(addDays(currentDate, -5 + daysUntilNextSunday), 10),
      45,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -5 + daysUntilNextSunday), 13),
      30,
    ),
    color: "emerald",
    location: "Main Conference Hall",
  },
  {
    id: "5",
    title: "Product Meeting",
    description: "Discuss product requirements",
    start: setMinutes(
      setHours(addDays(currentDate, -4 + daysUntilNextSunday), 9),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -4 + daysUntilNextSunday), 11),
      30,
    ),
    color: "orange",
    location: "Downtown Cafe",
  },
  {
    id: "5b",
    title: "Team Meeting",
    description: "Discuss new project requirements",
    start: setMinutes(
      setHours(addDays(currentDate, -4 + daysUntilNextSunday), 13),
      30,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -4 + daysUntilNextSunday), 14),
      0,
    ),
    color: "violet",
    location: "Downtown Cafe",
  },
  {
    id: "5c",
    title: "1:1 w/ Tommy",
    description: "Talent review",
    start: setMinutes(
      setHours(addDays(currentDate, -3 + daysUntilNextSunday), 9),
      45,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -3 + daysUntilNextSunday), 10),
      45,
    ),
    color: "violet",
    location: "Abbey Road Room",
  },
  {
    id: "5d",
    title: "Kick-off call",
    description: "Ultra fast call with Sonia",
    start: setMinutes(
      setHours(addDays(currentDate, -3 + daysUntilNextSunday), 11),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -3 + daysUntilNextSunday), 11),
      30,
    ),
    color: "violet",
    location: "Abbey Road Room",
  },
  {
    id: "5ef",
    title: "Weekly Review",
    description: "Manual process review",
    start: setMinutes(
      setHours(addDays(currentDate, -2 + daysUntilNextSunday), 8),
      45,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -2 + daysUntilNextSunday), 9),
      45,
    ),
    color: "blue",
  },
  {
    id: "5f",
    title: "Meeting w/ Mike",
    description: "Explore new ideas",
    start: setMinutes(
      setHours(addDays(currentDate, -2 + daysUntilNextSunday), 14),
      30,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -2 + daysUntilNextSunday), 15),
      30,
    ),
    color: "orange",
    location: "Main Conference Hall",
  },
  {
    id: "5g",
    title: "Family Time",
    description: "Some time to spend with family",
    start: setMinutes(
      setHours(addDays(currentDate, -1 + daysUntilNextSunday), 7),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, -1 + daysUntilNextSunday), 7),
      30,
    ),
    color: "rose",
  },
  {
    id: "w3-1",
    title: "Quarterly Planning",
    description: "Plan next quarter objectives",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday), 9),
      30,
    ),
    end: setMinutes(setHours(addDays(currentDate, daysUntilNextSunday), 12), 0),
    color: "blue",
    location: "Planning Room",
  },
  {
    id: "w3-2",
    title: "Vendor Meeting",
    description: "Review vendor proposals",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 1), 7),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 1), 8),
      30,
    ),
    color: "violet",
    location: "Meeting Room B",
  },
  {
    id: "w3-3",
    title: "Design Workshop",
    description: "Brainstorming session for new UI",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 1), 10),
      15,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 1), 12),
      45,
    ),
    color: "emerald",
    location: "Design Studio",
  },
  {
    id: "w3-4",
    title: "Lunch with CEO",
    description: "Informal discussion about company vision",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 1), 13),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 1), 14),
      30,
    ),
    color: "orange",
    location: "Executive Dining Room",
  },
  {
    id: "w3-5",
    title: "Technical Review",
    description: "Code review with engineering team",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 2), 11),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 2), 12),
      30,
    ),
    color: "blue",
    location: "Engineering Lab",
  },
  {
    id: "w3-6",
    title: "Customer Call",
    description: "Follow-up with key customer",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 2), 15),
      15,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 2), 16),
      0,
    ),
    color: "violet",
    location: "Call Center",
  },
  {
    id: "w3-7",
    title: "Team Building",
    description: "Offsite team building activity",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 3), 9),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 3), 17),
      0,
    ),
    color: "emerald",
    location: "Adventure Park",
    allDay: true,
  },
  {
    id: "w3-8",
    title: "Marketing Review",
    description: "Review campaign performance",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 4), 8),
      45,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 4), 10),
      15,
    ),
    color: "orange",
    location: "Marketing Room",
  },
  {
    id: "w3-9",
    title: "Product Roadmap",
    description: "Discuss product roadmap for next quarter",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 5), 14),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 5), 16),
      30,
    ),
    color: "blue",
    location: "Strategy Room",
  },
  {
    id: "w3-10",
    title: "Family Time",
    description: "Morning walk with family",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 6), 7),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 6), 7),
      30,
    ),
    color: "rose",
  },
  {
    id: "w3-11",
    title: "Family Time",
    description: "Brunch with family",
    start: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 6), 10),
      0,
    ),
    end: setMinutes(
      setHours(addDays(currentDate, daysUntilNextSunday + 6), 10),
      30,
    ),
    color: "rose",
  },
];

export default function Component({ apiEvents }: { apiEvents?: ApiCalendarEvent[] }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('week');
  const { currentDate, setCurrentDate, isColorVisible } = useCalendarContext();

  // Calculate date range based on current view and date
  const dateRange = useMemo(() => {
    const baseDate = currentDate;
    let startDate: Date;
    let endDate: Date;

    switch (currentView) {
      case 'month': {
        // Show full month + some padding
        startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        // Add some padding
        startDate.setDate(startDate.getDate() - 7);
        endDate.setDate(endDate.getDate() + 7);
        break;
      }
      case 'week': {
        // Exactly the current week (Sunday to Saturday)
        const startOfWeek = new Date(baseDate);
        startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Sunday
        startDate = new Date(startOfWeek);
        endDate = new Date(startOfWeek);
        endDate.setDate(endDate.getDate() + 6); // Saturday
        break;
      }
      case 'day': {
        // Show current day + some padding
        startDate = new Date(baseDate);
        startDate.setDate(startDate.getDate() - 1); // 1 day before
        endDate = new Date(baseDate);
        endDate.setDate(endDate.getDate() + 2); // 2 days after
        break;
      }
      case 'agenda': {
        // Show current date + extended range for agenda
        startDate = new Date(baseDate);
        startDate.setDate(startDate.getDate() - 7); // 1 week before
        endDate = new Date(baseDate);
        endDate.setDate(endDate.getDate() + 30); // 30 days after
        break;
      }
      default: {
        // Fallback to week view
        const startOfWeek = new Date(baseDate);
        startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Sunday
        startDate = new Date(startOfWeek);
        startDate.setDate(startDate.getDate() - 7); // 1 week before
        
        endDate = new Date(startOfWeek);
        endDate.setDate(endDate.getDate() + 21); // 3 weeks after
        break;
      }
    }

    // Ensure start time is beginning of day, end time is end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const range = {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
    };

    console.log('📅 Fetching events for range:', {
      view: currentView,
      baseDate: baseDate.toDateString(),
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
      range
    });

    return range;
  }, [currentDate, currentView]);

  // Fetch real Google Calendar events via tRPC
  const { data: trpcEvents, isLoading, error, refetch } = trpc.calendar.getEvents.useQuery(dateRange, {
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes  
    staleTime: 60 * 1000, // Consider data stale after 1 minute
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.data?.code === 'UNAUTHORIZED') {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Map API events (ISO strings) to CalendarEvent (Date objects)
  useEffect(() => {
    console.log('🔄 useEffect triggered - isLoading:', isLoading, 'trpcEvents:', trpcEvents?.length, 'apiEvents:', apiEvents?.length);
    
    // Prefer tRPC events over apiEvents prop
    const sourceEvents = trpcEvents || apiEvents;
    
    if (sourceEvents && sourceEvents.length > 0) {
      try {
        const mapped: CalendarEvent[] = sourceEvents.map((ev) => ({
          id: ev.id,
          title: ev.title ?? "Untitled",
          description: ev.description,
          start: new Date(ev.start),
          end: new Date(ev.end),
          allDay: ev.allDay,
          location: ev.location,
          color: "blue", // Default color for Gmail events
        }));
        setEvents(mapped);
        console.log(`✅ Loaded ${mapped.length} real events from Gmail/Google Calendar`);
      } catch (_e) {
        console.error('❌ Error mapping calendar events:', _e);
        // Use sample events as fallback only on error
        setEvents(sampleEvents);
      }
    } else if (!isLoading) {
      // No events returned for the range; show an empty calendar (no sample fallback)
      console.log('📝 No Gmail events found for this range');
      setEvents([]);
    }
  }, [trpcEvents, apiEvents, isLoading]);

  // Get tRPC utils for invalidation
  const utils = trpc.useUtils();

  // tRPC mutations
  const createEventMutation = trpc.calendar.createEvent.useMutation({
    onSuccess: () => {
      // Refetch events after creating
      utils.calendar.getEvents.invalidate();
    },
  });

  const updateEventMutation = trpc.calendar.updateEvent.useMutation({
    onSuccess: () => {
      // Refetch events after updating
      utils.calendar.getEvents.invalidate();
    },
  });

  const deleteEventMutation = trpc.calendar.deleteEvent.useMutation({
    onSuccess: () => {
      // Refetch events after deleting
      utils.calendar.getEvents.invalidate();
    },
  });

  // Filter events based on visible colors
  const visibleEvents = useMemo(() => {
    return events.filter((event) => isColorVisible(event.color));
  }, [events, isColorVisible]);

  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      // Try to create via API first
      await createEventMutation.mutateAsync({
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
        },
        end: {
          dateTime: event.end.toISOString(),
        },
      });
    } catch (error) {
      // Fallback to local state if API fails
      console.error('Failed to create event via API:', error);
      setEvents([...events, event]);
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      // Try to update via API first
      await updateEventMutation.mutateAsync({
        eventId: updatedEvent.id,
        summary: updatedEvent.title,
        description: updatedEvent.description,
        start: {
          dateTime: updatedEvent.start.toISOString(),
        },
        end: {
          dateTime: updatedEvent.end.toISOString(),
        },
      });
    } catch (error) {
      // Fallback to local state if API fails
      console.error('Failed to update event via API:', error);
      setEvents(
        events.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event,
        ),
      );
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      // Try to delete via API first
      await deleteEventMutation.mutateAsync({
        eventId,
      });
    } catch (error) {
      // Fallback to local state if API fails
      console.error('Failed to delete event via API:', error);
      setEvents(events.filter((event) => event.id !== eventId));
    }
  };

  // Show loading or error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading Gmail/Google Calendar events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-2">Error loading Gmail events:</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          {error.data?.code === 'UNAUTHORIZED' ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Please re-authenticate your Google account</p>
              <button 
                onClick={() => window.location.href = '/api/auth/signin'} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign in again
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Showing sample events instead</p>
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle view/date changes from the calendar component
  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    console.log('📅 View changed to:', newView);
    setCurrentView(newView);
  };

  const handleDateChange = (newDate: Date) => {
    console.log('📅 Date changed to:', newDate.toDateString());
    setCurrentDate(newDate);
  };

  const handleStarClick = (event: CalendarEvent) => {
    console.log('🌟 Star clicked on event:', event.title);

    // Create a formatted event context message
    const eventContext = `
📅 Event: ${event.title}
⏰ Time: ${event.allDay ? 'All day' : `${new Date(event.start).toLocaleString()} - ${new Date(event.end).toLocaleString()}`}
${event.location ? `📍 Location: ${event.location}` : ''}
${event.description ? `📋 Description: ${event.description}` : ''}
    `.trim();

    console.log('📝 Event context created:', eventContext);

    // Dispatch event to open right panel chat with this context
    console.log('🚀 Dispatching right-panel-chat:open-docked event');
    window.dispatchEvent(new CustomEvent('right-panel-chat:open-docked'));

    // Add event context to floating chat as well
    console.log('💬 Dispatching floating-chat:append-message event');
    window.dispatchEvent(new CustomEvent('floating-chat:append-message', {
      detail: {
        role: 'user',
        text: `Please help me with this event: ${eventContext}`
      }
    }));

    console.log('✅ Event added to chat context successfully:', event);
  };

  return (
    <EventCalendar
      events={visibleEvents}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      onStarClick={handleStarClick}
      initialView="week"
      onViewChange={handleViewChange}
      onDateChange={handleDateChange}
    />
  );
}
