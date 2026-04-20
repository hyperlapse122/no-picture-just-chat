import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env';

// Pooled URL for app runtime (PgBouncer-compatible: prepare: false)
const queryClient = postgres(env.DATABASE_URL, { prepare: false });

export const db = drizzle(queryClient);
export type Db = typeof db;
