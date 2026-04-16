import { defineConfig } from 'vite';

/**
 * Shared base Vite configuration for workspace packages.
 * Consumers should spread or merge this config with their own settings.
 *
 * @example
 * import { defineConfig, mergeConfig } from 'vite';
 * import sharedConfig from '@h82/no-picture-just-chat-config/vite';
 * export default mergeConfig(sharedConfig, defineConfig({ ... }));
 */
export default defineConfig({});
