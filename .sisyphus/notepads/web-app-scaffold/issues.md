# Issues — web-app-scaffold

## 2026-04-20 Session Start

No issues yet. Will record blockers, gotchas, and discoveries here.

## 2026-04-20 Gitignore verification
- Added explicit env ignores without catching `.env.example`.
- `.sisyphus/evidence/` is now ignored for session artifacts.

## 2026-04-20 Workspace install warnings
- `yarn install` finished with non-fatal peer dependency warnings for `@tanstack/query-core`, `csstype`, `eslint`, `prettier`, `typescript`, and `vite` on `@h82/no-picture-just-chat-web`.
- Warnings were expected for this scaffold state and did not block workspace registration.

## 2026-04-20 Post-install diagnostics
- `lsp_diagnostics` on `apps/web` reported existing scaffold issues: missing `routeTree.gen`, unresolved `@tanstack/react-devtools`, and route type mismatches in `index.tsx` / `about.tsx`.
- These diagnostics are unrelated to workspace registration, but they are worth tracking before the next scaffold task.

## 2026-04-20 T10 notes
- Bash verification emits a non-blocking mise warning about missing `npm:@typescript/native-preview@7.0.0-dev.20260419.1` before the actual command output.
- `drizzle-kit --version` still exits 0 despite that warning.

## 2026-04-20 T14 verification notes
- `yarn workspace @h82/no-picture-just-chat-web typecheck` still fails on a pre-existing root/app TS config issue: `TS5101` for deprecated `baseUrl` without `ignoreDeprecations: "6.0"`.
- This did not block schema creation or Neon `db:push`, but it prevents clean workspace typecheck verification until addressed separately.

## 2026-04-20 F2 Code Quality Review Findings

### CRITICAL — Build Broken
- `yarn workspace @h82/no-picture-just-chat-web build` fails with exit code 1.
- Root cause: `apps/web/src/integrations/trpc/server.ts:1` has a top-level static import of `getRequestHeaders` from `@tanstack/react-start/server` (server-only module). That file is imported by `routes/index.tsx`, so rolldown's `tanstack-start-core:import-protection` plugin blocks it when building the client environment.
- Fix options (per plugin error suggestions):
  - Rename file to `server.server.ts` so it's server-only
  - Wrap `getRequestHeaders()` in a dynamic import (same pattern as `routes/app.tsx:17`)
  - Use `createServerOnlyFn()` / `createIsomorphicFn()`

### AI Slop — `integrations/trpc/client.ts:14-18`
```ts
headers() {
  if (typeof window !== 'undefined') return {};
  return {};
}
```
Both branches return the same empty object. Either delete the `headers` function entirely or implement real header logic. Classic AI dead branch.

### Dead Code (not imported anywhere)
- `apps/web/src/components/Header.tsx` (70 lines)
- `apps/web/src/components/Footer.tsx` (42 lines)
- `apps/web/src/components/ThemeToggle.tsx` (80 lines)
- `apps/web/src/server/trpc/init.ts:9-15` — `protectedProcedure` defined but never used by any router
- `apps/web/src/db/schema.app.ts` — `demoItems` table defined but not queried by any procedure

### Minor
- `routes/login.tsx:64,92` uses `loginSchema.pick('email').allows({ email: value })` — awkward; could factor out per-field schemas (same pattern `routes/app.tsx` uses directly).
- `routes/api/trpc/$trpc.ts:11` passes `resHeaders: new Headers()` to `createTRPCContext` but `context.ts` destructures only `req` — discarded fields are harmless but inconsistent.

### Clean
- No `as any` outside auto-generated `routeTree.gen.ts`
- No `@ts-ignore` / `@ts-expect-error`
- No empty catch blocks
- No `console.log` (only `console.error` in `env.ts` and `$trpc.ts:13`, both acceptable)
- No barrel exports
- Lint / format / typecheck all PASS
- 1 unit test passing
