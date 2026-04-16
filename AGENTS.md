# NPJC — No Picture Just Chat

Anonymous BBS system with generative AI. Private monorepo, skeleton phase — shared config package only, no apps yet.

**Generated:** 2026-04-16 · **Commit:** a53ef93 · **Branch:** main

---

# Export Policy

## No Barrel Exports

Barrel exports and catch-all `index` re-export files are prohibited. Do not create `index.js`, `index.ts`, or similar files that re-export members from other files within the same directory or package.

### Rationale

- **Tree-shaking**: Tools identify and include only necessary code
- **IDE Discoverability**: Explicit paths improve navigation and auto-completion
- **Intentional Public APIs**: Forces conscious decisions about what's public
- **Tool-specific Imports**: Prevents loading unrelated dependencies (e.g., loading ESLint config without triggering Vite)

---

# Shared Config Package

## Package: `@h82/no-picture-just-chat-config` (`packages/config`)

Single internal shared config package. Key facts for agents:

- **6 subpath exports**: `./eslint`, `./prettier`, `./typescript`, `./vite`, `./vitest`, `./playwright`
- **ESM-only** (`"type": "module"`) — both root and config package use ESM
- **JSON subpath** (`./typescript` → `tsconfig.base.json`): dynamic `import()` requires `with { type: 'json' }` attribute in Node.js ≥ 20
- **No build step** — config files ship as source; no `dist/`
- **Plugins/tooling in root devDependencies** — `typescript-eslint`, `eslint-config-prettier`, etc. installed at root, resolved via Yarn hoisting
- **`@eslint/js` is not directly available** — use `tseslint.configs.recommended` (includes JS recommended internally)
- **Root consumer pattern**: thin `.js` wrappers re-export from package subpaths; `tsconfig.json` uses `"extends"`
- **No root wrappers for vite/vitest/playwright** until actual consumers (`apps/*`, `e2e/*`) exist

---

# Project Knowledge Base

## Overview

Private Yarn workspaces monorepo (skeleton phase). Currently contains only a shared config package — no apps, no e2e tests, no CI/CD.

**Stack**: Node.js 24 (mise) · Yarn 4.13.0 (node-modules linker) · TypeScript 5.8 · ESM throughout

## Structure

```
./
├── packages/config/   # @h82/no-picture-just-chat-config — shared tool configs (source, no build)
├── apps/              # (empty) future app workspaces
├── e2e/               # (empty) future e2e test workspaces
├── eslint.config.js   # thin wrapper → config package ./eslint
├── prettier.config.js # thin wrapper → config package ./prettier
└── tsconfig.json      # extends config package ./typescript
```

## Where to Look

| Task                            | Location                                                                 | Notes                                                     |
| ------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| Add ESLint/Prettier rules       | `packages/config/eslint.config.js`, `packages/config/prettier.config.js` | Shared; affects all consumers                             |
| Add TypeScript compiler options | `packages/config/tsconfig.base.json`                                     | Base config; consumers extend                             |
| Add a new app                   | `apps/<name>/`                                                           | Create `package.json`, add root config wrappers as needed |
| Add e2e tests                   | `e2e/<name>/`                                                            | Create `package.json`, import playwright config           |
| Add a new config subpath        | `packages/config/`                                                       | Add file + update `exports` in `package.json`             |

## Conventions

- **ESM everywhere** — `"type": "module"` in root and all packages. No CommonJS.
- **Yarn 4 workspaces** — `packages/*`, `apps/*`, `e2e/*`. `node-modules` linker (not PnP).
- **Strict TypeScript** — `strict`, `exactOptionalPropertyTypes`, `isolatedModules`, bundler resolution, ES2022 target
- **Formatting** — Prettier: 100 width, 2-space indent, single quotes, semicolons, trailing commas, LF
- **EditorConfig** — UTF-8, LF, 2-space indent, final newline
- **Lazy wrapper creation** — root config wrappers only when consumers exist
- **Peer dependencies** — config package declares tools as peers; `@playwright/test`, `vite`, `vitest` are optional

## Anti-Patterns

- **No barrel exports** — never create `index.js`/`index.ts` re-export files
- **No `@eslint/js` direct import** — use `tseslint.configs.recommended` instead
- **No `dist/` in config package** — ships as source, never build
- **No root wrappers without consumers** — don't create vite/vitest/playwright wrappers at root until `apps/`/`e2e/` exist
- **No Python** — use Node.js/Deno/Bun for scripting

## Commands

```bash
yarn lint              # ESLint (flat config)
yarn format:check      # Prettier check
yarn format            # Prettier write
yarn typecheck         # tsc --noEmit
```

## Notes

- **No `turbo.json`** — Turborepo orchestration not configured. Add when multiple packages need coordinated builds.
- **Empty workspace globs** — `apps/*` and `e2e/*` defined in workspaces but directories don't exist yet.
- **JSON import attribute** — `with { type: 'json' }` required for TypeScript config import in Node.js ≥ 20.
- **VSCode** — format-on-save with Prettier, ESLint auto-fix on save, flat config enabled.
- **ESLint 10 + flat config** — uses `tseslint.config()` spread pattern with `eslint-config-prettier`.
