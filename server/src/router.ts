import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { PokeAPI } from './lib/poke';

const t = initTRPC.create();

export const appRouter = t.router({
  poke: t.router({
    sendMessage: t.procedure
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

    health: t.procedure
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