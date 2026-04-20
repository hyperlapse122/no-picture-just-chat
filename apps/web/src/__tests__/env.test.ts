import { describe, it, expect, beforeAll } from 'vitest';
import { type } from 'arktype';

describe('env module', () => {
  beforeAll(() => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    process.env.DATABASE_URL_DIRECT = 'postgres://user:pass@localhost:5433/db';
    process.env.BETTER_AUTH_SECRET = 'a'.repeat(48);
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';
  });

  it('parseEnv accepts a valid env shape', async () => {
    const { parseEnv } = await import('../env');
    const result = parseEnv({
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      DATABASE_URL_DIRECT: 'postgres://user:pass@localhost:5433/db',
      BETTER_AUTH_SECRET: 'a'.repeat(48),
      BETTER_AUTH_URL: 'http://localhost:3000',
    });
    expect(result instanceof type.errors).toBe(false);
  });
});
