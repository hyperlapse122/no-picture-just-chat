import { type } from 'arktype';

const envSchema = type({
  DATABASE_URL: 'string.url',
  DATABASE_URL_DIRECT: 'string.url',
  BETTER_AUTH_SECRET: 'string >= 32',
  BETTER_AUTH_URL: 'string.url',
});

/**
 * Pure factory: validates an arbitrary input object against the env schema.
 * Used by tests (T32) to exercise the validator with synthetic input.
 */
export function parseEnv(input: Record<string, string | undefined>) {
  return envSchema(input);
}

const parsed = parseEnv(process.env);

if (parsed instanceof type.errors) {
  console.error('Invalid environment variables:\n' + parsed.summary);
  throw new Error('Invalid environment variables');
}

/** Validated env singleton. Import this instead of process.env. */
export const env = parsed;
