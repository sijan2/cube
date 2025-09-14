import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { auth } from './auth';

export async function createContext({ req }: CreateExpressContextOptions) {
  // Convert Express headers to Headers object
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value[0]);
    }
  });

  const session = await auth.api.getSession({ headers });

  return {
    session,
    user: session?.user || null,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;