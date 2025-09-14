import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { PokeAPI } from './lib/poke';
import { GoogleCalendarService } from './lib/calendar';
import { createContext, type Context } from './lib/context';

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});

const calendarService = new GoogleCalendarService();

// Shared typed event schema for API responses
const ApiCalendarEvent = z.object({
  id: z.string(),
  title: z.string().optional().default('Untitled'),
  description: z.string().optional(),
  start: z.string(), // ISO string
  end: z.string(),   // ISO string
  allDay: z.boolean().optional(),
  location: z.string().optional(),
});
type ApiCalendarEvent = z.infer<typeof ApiCalendarEvent>;

export const appRouter = t.router({
  // Auth procedures
  auth: t.router({
    getSession: publicProcedure.query(({ ctx }) => {
      return ctx.session;
    }),

    getUser: protectedProcedure.query(({ ctx }) => {
      return ctx.user;
    }),
  }),

  // Calendar procedures
  calendar: t.router({
    getEvents: protectedProcedure
      .input(z.object({
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
      }))
      .output(z.array(ApiCalendarEvent))
      .query(async ({ input, ctx }) => {
        const googleEvents = await calendarService.getEvents(
          ctx.user.id,
          input.timeMin,
          input.timeMax
        );

        // Map Google Calendar events to API shape
        const mapped: ApiCalendarEvent[] = (googleEvents || [])
          .map((ev: any) => {
            // Support all-day events that provide date instead of dateTime
            const startIso = ev.start?.dateTime
              ? new Date(ev.start.dateTime).toISOString()
              : ev.start?.date
                ? new Date(ev.start.date + 'T00:00:00.000Z').toISOString()
                : undefined;
            const endIso = ev.end?.dateTime
              ? new Date(ev.end.dateTime).toISOString()
              : ev.end?.date
                ? new Date(ev.end.date + 'T00:00:00.000Z').toISOString()
                : undefined;

            if (!startIso || !endIso) return null;

            return {
              id: String(ev.id ?? `${startIso}-${endIso}`),
              title: String(ev.summary ?? 'Untitled'),
              description: ev.description ? String(ev.description) : undefined,
              start: startIso,
              end: endIso,
              allDay: !!ev.start?.date && !!ev.end?.date,
              location: ev.location ? String(ev.location) : undefined,
            } satisfies ApiCalendarEvent;
          })
          .filter(Boolean) as ApiCalendarEvent[];

        return mapped;
      }),

    createEvent: protectedProcedure
      .input(z.object({
        summary: z.string().min(1),
        description: z.string().optional(),
        start: z.object({
          dateTime: z.string(),
          timeZone: z.string().optional(),
        }),
        end: z.object({
          dateTime: z.string(),
          timeZone: z.string().optional(),
        }),
        attendees: z.array(z.object({
          email: z.string().email(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await calendarService.createEvent(ctx.user.id, input);
      }),

    updateEvent: protectedProcedure
      .input(z.object({
        eventId: z.string(),
        summary: z.string().optional(),
        description: z.string().optional(),
        start: z.object({
          dateTime: z.string(),
          timeZone: z.string().optional(),
        }).optional(),
        end: z.object({
          dateTime: z.string(),
          timeZone: z.string().optional(),
        }).optional(),
        attendees: z.array(z.object({
          email: z.string().email(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { eventId, ...updateData } = input;
        return await calendarService.updateEvent(ctx.user.id, eventId, updateData);
      }),

    deleteEvent: protectedProcedure
      .input(z.object({
        eventId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await calendarService.deleteEvent(ctx.user.id, input.eventId);
      }),
  }),

  // Existing poke procedures
  poke: t.router({
    sendMessage: publicProcedure
      .input(z.object({
        message: z.string().min(1, 'Message cannot be empty')
      }))
      .mutation(async ({ input }) => {
        if (!process.env.POKE_API_KEY) {
          throw new Error('POKE_API_KEY not configured');
        }

        const pokeAPI = new PokeAPI(process.env.POKE_API_KEY);
        const result = await pokeAPI.sendMessage(input.message);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to send message to Poke');
        }

        return {
          success: true,
          message: 'Message sent successfully to Poke',
          data: result.data
        };
      }),

    health: publicProcedure
      .query(() => {
        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
          hasApiKey: !!process.env.POKE_API_KEY
        };
      })
  })
});

export type AppRouter = typeof appRouter;