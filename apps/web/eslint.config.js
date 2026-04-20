import { defineConfig } from 'eslint/config';
import baseConfig from '@h82/no-picture-just-chat-config/eslint';

export default defineConfig({ ignores: ['dist/**', '.output/**', '.vinxi/**'] }, ...baseConfig);
