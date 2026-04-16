import { defineConfig } from 'vitest/config';

/**
 * Shared base Vitest configuration for workspace packages.
 * Consumers should spread or merge this config with their own settings.
 *
 * @example
 * import { defineConfig, mergeConfig } from 'vitest/config';
 * import sharedConfig from '@h82/no-picture-just-chat-config/vitest';
 * export default mergeConfig(sharedConfig, defineConfig({ test: { ... } }));
 */
export default defineConfig({
  test: {},
});
