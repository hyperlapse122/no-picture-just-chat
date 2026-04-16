## [2026-04-16] Task: T2

Created a source-only config package with explicit subpath exports and no barrel/index entrypoint; package metadata stays private ESM, and stubs are sufficient for Yarn workspace resolution.

## [2026-04-16] Task: T5

- Root consumer wrapper stubs must use `.mjs` for JS-based configs in this repo because the root is CommonJS-default.
- Keep root wrappers minimal and avoid creating unused Vite/Vitest/Playwright wrappers until consumers exist.

## [2026-04-16] Task: T4

- A tiny root-level ESM harness with dynamic `import()` is enough to validate all six config subpaths without fixtures or servers.
- The script can be run early against stub exports and still provide clear pass/fail output per subpath.

## [2026-04-16] Task: T6

- ESLint 10 flat config uses `tseslint.config()` helper from `typescript-eslint` package
- `tseslint.configs.recommended` spreads into 3 config objects, `prettierConfig` adds 1 → total 4 entries
- `eslint-config-prettier` exports a plain `{ rules: {...} }` object compatible with flat config (no wrapper needed)
- No `@eslint/js` direct import needed — `typescript-eslint` bundles JS recommended rules internally
- Package exports map resolves `@h82/no-picture-just-chat-config/eslint` → `eslint.config.js`

## [2026-04-16] Task: T7

- Replaced the stub Prettier shared config with a minimal ESM export.
- Kept only baseline formatting options aligned with the repo defaults; no plugins added.
- Verified the package export resolves to a non-null object and the config file contains no `plugins` entry.

## [2026-04-16] Task: T9

- Vite and Vitest configs are independent — vitest.config.js imports from `vitest/config`, not from the vite config
- Both use `defineConfig` but from different packages (`vite` vs `vitest/config`)
- Configs are intentionally empty/minimal — consumers use `mergeConfig` to layer their own settings
- Package subpath exports (`/vite`, `/vitest`) already configured in package.json from prior tasks
- vite@6.4.2 and vitest@3.2.4 both resolve correctly via hoisted root node_modules

## [2026-04-16] Task: T10

- Replaced the Playwright shared config stub with a generic `defineConfig` export from `@playwright/test`.
- Kept the config intentionally shared-only: no `baseURL`, no fixtures, no project-specific browser setup.

## [2026-04-16] Task: T11

- Root `eslint.config.mjs` and `prettier.config.mjs` are now thin re-export wrappers over the shared config package.
- Verified the root package already depends on `@h82/no-picture-just-chat-config`, so no local config duplication is needed.
- Keeping these wrappers tiny preserves a single source of truth for shared config behavior.
- Verified the package subpath import resolves and no root Playwright wrapper files exist.

## [2026-04-16] Task: T8

- TypeScript 5.9.3 resolves `extends` through package.json `exports` field — `"extends": "@h82/no-picture-just-chat-config/typescript"` correctly resolves to `packages/config/tsconfig.base.json`
- `tsc --showConfig` requires at least one `.ts` file present to succeed (TS18003 otherwise). This is expected in an empty repo — a temporary dummy file works for verification.
- `strict: true` implies many sub-flags (noImplicitAny, strictNullChecks, etc.) which show up expanded in `--showConfig` output
- `moduleResolution: "Bundler"` implies `resolvePackageJsonExports: true` and `resolvePackageJsonImports: true`

## [2026-04-16] Task: T13

Updated root README.md and created packages/config/README.md.
Documented all 6 tools (eslint, prettier, typescript, vite, vitest, playwright).
Explicitly stated core policies: no barrel exports, internal-only usage, and minimal root wrapper creation.
Included subpath usage examples for all tools in the config package README.

## [2026-04-16] Task: T12

- `validate:config` script wired to `node scripts/validate-config.mjs` — all 6 subpaths PASS
- Prettier `--write .` needed to fix formatting in config files (double→single quotes after prettier config)
- `.zed/settings.json` uses JSONC (comments + trailing commas) which Prettier cannot cleanly format — added `.prettierignore` with `.zed`, `.yarn`, `.sisyphus` entries
- `tsc --noEmit` exits 0 with `"files": []` in root tsconfig (no TS source files yet)
- `eslint .` exits 0 cleanly — no lint errors in config package JS files
- All 4 validation commands (`validate:config`, `lint`, `format:check`, `typecheck`) exit 0
