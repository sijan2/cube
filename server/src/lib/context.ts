import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { auth } from './auth';

export async function createContext({ req }: CreateExpressContextOptions) {
  const session = await auth.api.getSession({ headers: req.headers });

  return {
    session,
    user: session?.user || null,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;