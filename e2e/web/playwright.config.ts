import { defineConfig, devices } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));
const webDir = resolve(configDir, '../../apps/web');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      '[ -f ./.env ] && set -a && . ./.env && set +a; PATH="$PWD/../../node_modules/.bin:$PATH" vite dev --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    cwd: webDir,
  },
});
