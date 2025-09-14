import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/src/router';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3002/trpc',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include', // Always include cookies for cross-origin
        });
      },
    }),
  ],
});