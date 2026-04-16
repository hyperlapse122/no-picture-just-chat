import { defineConfig } from '@playwright/test';

/**
 * Shared base Playwright configuration for workspace e2e projects.
 * Consumers should use this as a base and override project-specific settings.
 *
 * @example
 * import { defineConfig, mergeConfig } from '@playwright/test';
 * import sharedConfig from '@h82/no-picture-just-chat-config/playwright';
 * export default mergeConfig(sharedConfig, defineConfig({ ... }));
 */
export default defineConfig({
  testMatch: ['**/*.spec.ts', '**/*.e2e.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
});
