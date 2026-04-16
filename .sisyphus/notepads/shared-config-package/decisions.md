# Decisions

<!-- Append architectural decisions here. NEVER overwrite. -->

## 2026-04-16 Initial Architecture

- Package: `@h82/no-picture-just-chat-config` at `packages/config`
- private: true, type: module (ESM package)
- Subpath exports only: ./eslint, ./prettier, ./typescript, ./vite, ./vitest, ./playwright
- NO barrel exports, NO index.js
- NO build step - ship source config files directly
- Root stays CommonJS-default; root consumer wrappers use .mjs extension
- Root consumer files: eslint.config.mjs, prettier.config.mjs, tsconfig.json
- NO root wrappers for vite/vitest/playwright (no current consumers)
- Yarn 4 with node-modules linker; workspace:\* for internal package dep
- .editorconfig: UTF-8, LF, 2-space indent, final newline
