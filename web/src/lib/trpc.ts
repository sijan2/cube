import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

// Use untyped TRPC client on the web to avoid cross-package type/import issues at build time
export const trpc = createTRPCReact<any>();

export const trpcClient = createTRPCClient<any>({
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