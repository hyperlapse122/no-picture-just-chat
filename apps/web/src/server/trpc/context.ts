import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { db } from '@/db/client';
import { auth } from '@/lib/auth';

export const createTRPCContext = async ({ req }: FetchCreateContextFnOptions) => {
  const session = await auth.api.getSession({ headers: req.headers });

  return { session, db, headers: req.headers };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
