// apps/web/src/lib/auth.ts
//
// NOTE: `import * as authSchema` is intentional — the drizzleAdapter expects a
// schema object map (Record<string, Table>), not individual named imports.
// This is the only namespace import permitted in this codebase.

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '@/db/client';
import * as authSchema from '@/db/schema.auth';
import { env } from '@/env';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  // tanstackStartCookies MUST stay last — it wraps cookie set/get behavior for
  // TanStack Start and breaks cookie handling if another plugin follows it.
  plugins: [tanstackStartCookies()],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
