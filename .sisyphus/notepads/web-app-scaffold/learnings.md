# Learnings — web-app-scaffold

## 2026-04-20 Initial

### Branch Status
- Branch was ALREADY renamed to `feature/add-web-app-scaffold` before session started
- T1 is pre-completed; no rename needed

### Environment
- Node 24 via mise (npm:@typescript/native-preview warning is benign — unrelated package)
- Working dir: `/Users/h82/.local/share/opencode/worktree/70bd3fc8425a9f0c9f392fcc7b9f73b7b05eeaf5/misty-pixel`
- Yarn 4, node-modules linker

### Key Conventions (from AGENTS.md)
- ESM throughout (`"type": "module"`)
- No barrel exports (`index.ts` re-exports forbidden)
- Yarn 4 workspaces — install from root always
- Left hook: pre-commit (eslint+prettier), commit-msg (commitlint), pre-push (branch name)
- NEVER `LEFTHOOK=0` bypass
- Commit format: `<type>(<scope>): <subject>` — conventional commits
- All package versions MUST be verified via `yarn npm info <pkg> version`

### Neon Connection Pattern
- Pooled URL (`DATABASE_URL`): for app runtime, `prepare: false` for PgBouncer
- Direct URL (`DATABASE_URL_DIRECT`): for migrations/DDL

### TanStack Start Plugin Order (CRITICAL)
- `tsConfigPaths(), tanstackStart(), viteReact(), tailwindcss()`
- `tanstackStart` MUST come before `viteReact` (non-negotiable)

### SSR Pattern (core rule)
- Loaders: prefetch via `context.queryClient.ensureQueryData(...)` — do NOT return query data
- Components: read via `useQuery(...)` from cache
- Same `queryOptions` in loader + component = cache key match = hydration hit
- `staleTime: 60_000` — prevents immediate refetch on hydration
- No manual `<HydrationBoundary>` — `setupRouterSsrQueryIntegration` handles it

## 2026-04-20 T3 — Scaffold & Curation

### TanStack CLI (2026-04)
- `@tanstack/create-start` is **DEPRECATED** (prints a warning on every run).
  The upstream replacement is `@tanstack/cli create`.
- Published versions at scaffold time (verified via `npm view …`):
  - `@tanstack/cli`          → `0.64.0`
  - `@tanstack/create-start` → `0.59.21` (deprecated)
- Use `@tanstack/cli` going forward; `npx --yes @tanstack/cli@latest create <name>`.

### Non-interactive flag set that actually works
```
npx --yes @tanstack/cli@latest create <name> \
  --framework React \
  --no-install --no-git --no-examples --no-toolchain \
  --package-manager yarn -y
```
- `--no-install` avoids creating a lockfile and avoids install-inside-/tmp side effects
- `--no-git` avoids a nested `.git` that would confuse any subsequent `git add`
- `--no-examples` keeps the starter minimal (still emits about.tsx + index.tsx demo pages)
- `--no-toolchain` skips biome/eslint generation (root config is authoritative in NPJC)
- `-y` accepts defaults for anything not overridden

### What the current scaffold emits vs what Task 3 expected
- Task 3 lists `index.html` under "at minimum" — **the scaffolder no longer emits one**.
- Modern TanStack Start renders the full `<html>…</html>` via `shellComponent: RootDocument`
  inside `src/routes/__root.tsx`. The HTML document is React-owned.
- Plugin chain in the scaffolded `vite.config.ts` is:
  `[devtools(), tailwindcss(), tanstackStart(), viteReact()]`
  — T8 will reorder to `[tsConfigPaths(), tanstackStart(), viteReact(), tailwindcss()]`.
- `resolve: { tsconfigPaths: true }` is set on the Vite config object itself (Vite 8 API),
  not as a plugin — T8 will need to decide whether to keep this shape or switch to the
  `vite-tsconfig-paths` plugin.

### Curation rules applied (for any future scaffold re-runs)
KEEP: `src/` (router.tsx, styles.css, components/, routes/), `public/`, `vite.config.ts`, `tsconfig.json`
DROP: `package.json` (T4), `.cta.json`, `.gitignore`, `.vscode/`, `README.md`
ABSENT: `index.html`, `app.config.ts`, `tailwind.config.*`, `postcss.config.*`, any lockfile

### Scaffold package.json — preserved for T4 reference
- `"type": "module"` (ESM)
- Imports alias: `"#/*": "./src/*"` (matches tsconfig `paths`)
- Scripts: `dev`, `build`, `preview`, `test` (vitest run)
- Dep versions emitted by scaffolder (T4 MUST re-verify each with `npm view <pkg> version`):
  - react/react-dom `^19.2.0`, vite `^8.0.0`, vitest `^3.0.5`, typescript `^5.7.2`
  - `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/react-devtools`,
    `@tanstack/react-router-devtools`, `@tanstack/react-router-ssr-query` → pinned to `latest`
  - `@tanstack/router-plugin` `^1.132.0`, `@tailwindcss/vite` / `tailwindcss` `^4.1.18`
  - `lucide-react` `^0.545.0` (used by scaffolded Header/Footer/ThemeToggle)
- `pnpm.onlyBuiltDependencies: ["esbuild", "lightningcss"]` — ignore; Yarn 4 equivalent
  is a different knob (T4 decides if it needs one).

### Invariants that held after curation
- `git status --porcelain -uall` shows **only** `apps/web/**` and `.sisyphus/**` — no root pollution.
- No `package-lock.json` / `pnpm-lock.yaml` anywhere in the repo.
- `apps/web/package.json` absent (T4 will add).
- `apps/web/yarn.lock` absent.
- `/tmp/web-scaffold-tmp` cleaned up.

### Evidence
- `.sisyphus/evidence/task-3-scaffold-audit.txt`
- `.sisyphus/evidence/task-3-scaffold-invariants.txt`

## 2026-04-20 T5 — Workspace install verification

### Verified install behavior
- `yarn install` from repo root completed successfully under Yarn 4.13.0.
- `apps/web` was recognized as workspace `@h82/no-picture-just-chat-web`.
- Root-only lockfile invariant held: one `yarn.lock`, no `package-lock.json`, no `pnpm-lock.yaml`.
- `apps/web/node_modules/` exists / hoisted modules are present under the root node_modules layout.

### Evidence
- `.sisyphus/evidence/task-5-install.log`
- `.sisyphus/evidence/task-5-workspaces.txt`

## 2026-04-20 T4 — apps/web/package.json

### Verified package versions (via `yarn npm info --fields version --json`)
- `@tanstack/react-start` `1.167.42`
- `@tanstack/react-router` `1.168.23`
- `@tanstack/react-router-ssr-query` `1.166.11`
- `@tanstack/react-query` `5.99.2`
- `@tanstack/react-form` `1.29.0`
- `@trpc/server` `11.16.0`
- `@trpc/client` `11.16.0`
- `@trpc/tanstack-react-query` `11.16.0`
- `arktype` `2.2.0`
- `drizzle-orm` `0.45.2`
- `postgres` `3.4.9`
- `better-auth` `1.6.5`
- `@better-auth/drizzle-adapter` still exists in the registry at `1.6.5`, but per task guidance it was not added as a separate dependency
- `react` / `react-dom` `19.2.5`
- `tailwindcss` / `@tailwindcss/vite` `4.2.2`
- `clsx` `2.1.1`
- `tailwind-merge` `3.5.0`
- `@tanstack/router-devtools` `1.166.13`
- `@tanstack/react-query-devtools` `5.99.2`
- `@types/react` `19.2.14`
- `@types/react-dom` `19.2.3`
- `@types/node` `25.6.0`
- `@vitejs/plugin-react` `6.0.1`
- `vite-tsconfig-paths` `6.1.1`
- `drizzle-kit` `0.31.10`

### Peer-dependency compatibility notes
- `@tanstack/react-start` accepts React 18/19 and Vite `>=7`; root Vite `8.0.8` is compatible
- `@trpc/tanstack-react-query` requires TypeScript `>=5.7.2`; root TypeScript `6.0.3` is compatible
- `better-auth` requires `drizzle-kit >=0.31.4` and `drizzle-orm ^0.45.2`; selected versions satisfy both
- None of the checked packages declare ESLint peers

## 2026-04-20 T6/T7 — Shared config wrappers and project reference

### apps/web wrapper pattern
- `apps/web/eslint.config.js` uses the same thin ESM default-export wrapper shape as the repo root, but names the import `baseConfig`.
- `apps/web/prettier.config.js` can be a direct re-export: `export { default } from '@h82/no-picture-just-chat-config/prettier';`

### apps/web tsconfig overrides kept intentionally narrow
- The app tsconfig now extends `@h82/no-picture-just-chat-config/typescript` and only overrides the approved compatibility flags.
- `verbatimModuleSyntax: false` is preserved for TanStack Start compatibility.
- `exactOptionalPropertyTypes: false` is preserved for Drizzle / better-auth typing compatibility.
- `composite: true` belongs only on app-level tsconfigs; the root tsconfig stays non-composite and only gains a project reference.

### Evidence
- `.sisyphus/evidence/task-6-config-resolve.txt`
- `.sisyphus/evidence/task-7-references.txt`
- Tailwind CSS v4 is purely CSS-first. In Vite, the `@tailwindcss/vite` plugin handles resolution directly, eliminating the need for `tailwind.config.js` or PostCSS configs.
- When using TanStack Start + Vite React + Tailwind v4 + TS Paths, the plugin order must be: `tsConfigPaths() -> tanstackStart() -> viteReact() -> tailwindcss()`. If tanstackStart runs after viteReact, rendering or route generation can fail.

## 2026-04-20 T10 — Drizzle setup

### Drizzle + Neon runtime split
- `apps/web/drizzle.config.ts` should always prefer `DATABASE_URL_DIRECT` and only fall back to `DATABASE_URL`.
- `apps/web/src/db/client.ts` should use `drizzle-orm/postgres-js` with `postgres` rather than `node-postgres` for the app runtime.
- Neon pooled connections require `prepare: false`; omitting that can break PgBouncer compatibility.
- Keep schema references explicit (`schema.auth.ts`, `schema.app.ts`) and do not introduce `src/db/index.ts`.

## T11 — Neon + env setup (2026-04-20)

- `neonctl projects create --output json` returns `connection_uris[0]` with both `host` and `pooler_host` in `connection_parameters` — you can build both URLs from one create call without extra `connection-string` invocations.
- `neonctl connection-string` returns `postgresql://...&channel_binding=require`. The extra `channel_binding=require` is a Neon-side security param; safe to keep when converting scheme to `postgres://`.
- `postgres://` and `postgresql://` are equivalent per libpq URI spec; project pins `postgres://` for consistency.
- Neon defaults new projects to 0.25–0.25 CU autoscaling with suspend_timeout=0 (scale-to-zero).
- Project org is inferred automatically (`org-wispy-bar-56131790`) when user has only one org.
- Region pinned: `aws-us-east-1` (other Neon projects in this account are `ap-southeast-1`; not co-located).
- `apps/web/.env.example` must NOT contain real URLs — lefthook's eslint/prettier ignore `.env*` but `git check-ignore` is the authoritative gate.
- `.sisyphus/evidence/` is gitignored via root `.gitignore` rule `.sisyphus/*` + `.sisyphus/evidence/` — safe to stash raw secrets there for debugging.
- BETTER_AUTH_SECRET generation: `openssl rand -base64 48 | tr -d '\n' | head -c 48` yields exactly 48 URL-safe-ish chars (base64 has `+/=` but no newlines after `tr`).


## T9 - shadcn init with TanStack Start
- shadcn@4.3.0 changed its CLI defaults to use base libraries like radix and presets. The `--base-color` flag was removed. To restore the old v3 behavior (`new-york` with `slate`), one has to configure `style: new-york` in `components.json` before running `shadcn add`, as the new v4 default (radix-nova) lacks the `form` wrapper component and instead relies on `field` or similar.

## T9 - shadcn cleanup
- shadcn adds a large number of components and bloated CSS defaults when its registry specifies deep trees (like the old new-york registry). Manual pruning of CSS and dependencies in `package.json` is needed to keep the footprint strictly bounded to the required 5 components.

## 2026-04-20 T14 — Drizzle schemas + Neon push

- better-auth's Drizzle/Postgres adapter expects the canonical auth table names and column names exactly as documented: `user`, `session`, `account`, `verification`.
- Keep app tables split from auth tables: `src/db/schema.auth.ts` and `src/db/schema.app.ts`; do not introduce a `src/db/index.ts` barrel.
- In this repo's non-TTY shell, `drizzle-kit push` with `strict: true` needs `--force` to complete non-interactively even for create-table statements.
- Verified Neon public tables after push: `account`, `demo_items`, `session`, `user`, `verification`.

## 2026-04-20 T17 — better-auth server module

## 2026-04-20 T22 — SSR query integrations

- `createTRPCOptionsProxy` must be imported from `@trpc/tanstack-react-query` directly; the `create-options-proxy` subpath does not exist.
- `getRequestHeaders()` from `@tanstack/react-start/server` is the server-safe way to forward incoming headers into SSR tRPC calls.
- SSR loaders should use a per-request `QueryClient` on the server and a browser singleton on the client; `staleTime: 60_000` avoids immediate hydration refetch churn.

## 2026-04-20 T24 — tRPC client integrations

- `@trpc/tanstack-react-query@11.16.0` exports `createTRPCContext` from the package root; no adaptation layer was needed for the React-bound proxy file.
- The subpath `@trpc/tanstack-react-query/create-options-proxy` is **not** exported in this install (`ERR_PACKAGE_PATH_NOT_EXPORTED`), so integrations should import from the package root instead of assuming internal subpaths are public.
- Browser/session-safe client transport is `httpBatchLink` with a custom `fetch` that forces `credentials: 'include'`; server-side base URL should resolve from `BETTER_AUTH_URL` and otherwise fall back to `http://localhost:3000`.
- Keep the integration surface explicit: `src/integrations/trpc/client.ts` and `src/integrations/trpc/react.tsx` only; no `src/integrations/index.ts` or `src/integrations/trpc/index.ts` barrels.

## 2026-04-20 T25 — home route SSR prefetch pattern

- TanStack Router home routes can SSR-prefetch tRPC data by creating a server proxy inside `loader` with `createServerTRPC(context.queryClient)` and awaiting `context.queryClient.ensureQueryData(...)`.
- The route component should read the exact same `queryOptions` via `useQuery(useTRPC().demo.greet.queryOptions(...))`; the loader must not return the query data or use `Route.useLoaderData()`.

- Verified `better-auth` 1.6.5 exports before wiring imports: Drizzle adapter is `better-auth/adapters/drizzle`, TanStack Start cookies plugin is `better-auth/tanstack-start`, and the React client export for follow-up work is `better-auth/react`.
- `tanstackStartCookies()` must be the final plugin in the `plugins` array; the package typings and inline docs both describe it as the cookie bridge for TanStack Start.
- `import * as authSchema` is the one justified namespace import here because `drizzleAdapter(..., { schema })` expects the full schema object map, not individual table bindings.
- Workspace-wide `yarn workspace @h82/no-picture-just-chat-web exec tsc --noEmit` is currently blocked by existing scaffold issues (`baseUrl` deprecation warning plus missing `routeTree.gen` / devtools types), but `apps/web/src/lib/auth.ts` itself is clean via LSP diagnostics.

## 2026-04-20 T18 — TanStack Start auth catch-all route

- `apps/web/src/routes/api/` had no existing server-route examples, so the catch-all auth handler follows TanStack Start's `createServerFileRoute('/api/auth/$').methods(...)` convention directly.
- The handler is intentionally thin: both `GET` and `POST` forward straight to `auth.handler(request)` with no extra headers or business logic.

## 2026-04-20 T19 — better-auth client module

- Verified `better-auth/react` exists via `yarn npm info better-auth exports --json | grep react` before creating the client wrapper.
- `createAuthClient` needed an explicit `ReturnType<typeof createAuthClient>` annotation to keep LSP diagnostics clean in `apps/web/src/lib/auth-client.ts`.
- The client wrapper stays browser-origin aware and avoids hardcoded localhost URLs.

## 2026-04-20 T18 — better-auth end-to-end verification + C7

### Blockers encountered (prior-task artifacts)
- `yarn workspace @h82/no-picture-just-chat-web dev` failed with `command not found: vite`
  because apps/web/package.json does not declare `vite` / `typescript` as direct deps —
  the config package declares them as peers. Yarn 4 does NOT put root `node_modules/.bin`
  on a workspace script's PATH if the workspace doesn't declare the dep. Workaround used:
  `PATH="$ROOT/node_modules/.bin:$PATH" vite dev --port 3000` directly in tmux.
- `__root.tsx` imports `@tanstack/react-devtools`, but that package was NOT in
  `apps/web/package.json` (was pruned at some earlier step along with the shadcn cleanup).
  Added `@tanstack/react-devtools@0.10.2` as a devDep to fix the 500.
- `@better-auth/core@1.6.5` requires `@opentelemetry/api ^1.9.0` as a **non-optional peer
  dependency** (not declared on `better-auth` itself — only on the nested `@better-auth/core`).
  Missing it causes `Cannot find package '@opentelemetry/api' imported from .../tracer.mjs`
  at first request after auth init. Added `@opentelemetry/api@1.9.1`.
- Both of these `package.json` + `yarn.lock` changes are INTENTIONALLY left uncommitted by
  this task — C7's scope is strictly the 3 better-auth wiring files. A follow-up task
  should land the missing deps cleanly.

### Verification outcomes (port 3000)
- `GET /` → `200` (after adding the two missing deps).
- `POST /api/auth/sign-up/email` → `200`, `Set-Cookie: better-auth.session_token=...; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/`, body contains `"email":"qa-bot@example.test"` and `"id":"YWIEc6Uk4c4WgL0yGtrFL8kBZTl55wml"`.
- `POST /api/auth/sign-in/email` → `200`, fresh `Set-Cookie` with `HttpOnly`, body `{"redirect":false, "token":"…", "user":{…}}`.
- `psql` against `DATABASE_URL_DIRECT`: exactly one `"user"` row with `email='qa-bot@example.test'`, `name='QA Bot'`, `email_verified=false`, `created_at='2026-04-19 16:33:24.478'` — confirming the drizzle adapter persisted through to Neon.

### Schema columns are snake_case in Postgres
- Drizzle-exposed fields (`emailVerified`, `createdAt`, etc.) are mapped to **snake_case columns**
  in Neon (`email_verified`, `created_at`). Any raw psql check must use the snake_case names.

### Evidence (uncommitted, under .sisyphus/evidence/)
- `task-18-signup-response.txt` — full curl -i sign-up response
- `task-18-signin-response.txt` — full curl -i sign-in response
- `task-18-db-row.txt` — psql SELECT result

### C7
- Commit `56b48a9` — `feat(web): add better-auth with drizzle adapter`
- Exactly 3 files: `apps/web/src/lib/auth.ts`, `apps/web/src/lib/auth-client.ts`, `apps/web/src/routes/api/auth/$.ts`
- Lefthook pre-commit (eslint + prettier) and commit-msg (commitlint) passed cleanly.

### Misc
- Port 3000 was occupied at task start by a stale `apps/auth/.output/server/index.mjs`
  from a different worktree (`clever-wizard`). Killed that PID before starting our server.
- The test user `qa-bot@example.test` (password `QaBot!2026Pass`) is intentionally left
  in the Neon `user` table for T33 Playwright tests to reuse.

## 2026-04-20 T26 — tRPC server scaffold

- `auth.api.getSession({ headers: req.headers })` is the correct way to derive the server session for tRPC fetch-context creation in this app.
- `db` can be passed through tRPC context directly from `@/db/client`; the demo mutation should stay side-effect free and only echo validated input.
- `arktype` validators work directly with tRPC v11 `.input(...)` here; no Standard Schema adapter layer is needed.
- `apps/web/src/server/` had no prior contents, so creating `apps/web/src/server/trpc/` introduced no barrel-file conflicts; `find apps/web/src/server \( -name 'index.ts' -o -name 'index.js' \)` returned empty.
- LSP diagnostics are clean for `apps/web/src/server/trpc/context.ts`, `init.ts`, and `router.ts`.
- Workspace typecheck remains blocked by a pre-existing app config issue outside this task: `apps/web/tsconfig.json` uses deprecated `baseUrl`, which TypeScript 6 reports as `TS5101` unless `ignoreDeprecations` is set.

## 2026-04-20 T27 — tRPC HTTP route mount

- TanStack Start route handlers should use `createFileRoute(...).server.handlers` here; `createServerFileRoute` is not available in this version.
- tRPC HTTP mounting stays thin: one `fetchRequestHandler`, shared `endpoint: '/api/trpc'`, and both `GET`/`POST` delegate to the same request handler.
- `createTRPCContext` expects a fresh `Headers()` instance for `resHeaders` when used through the fetch adapter.

## 2026-04-20 T28 — router SSR query wiring

- `@tanstack/react-router-ssr-query@1.166.11` exports `setupRouterSsrQueryIntegration` as a named export; use it directly from `@tanstack/react-router-ssr-query`.
- The app router should expose a `createRouter()` factory, create a fresh `queryClient` per router instance, and place only `queryClient` on the router context.
- `setupRouterSsrQueryIntegration({ router, queryClient })` replaces any need for manual `<HydrationBoundary>` usage in `apps/web/src/`.
- Keep `defaultPreload: 'intent'` on the router config while wiring SSR query integration.

- Rewrote `__root.tsx` to configure the Root Route with `createRootRouteWithContext<{ queryClient: QueryClient }>()`.
- Setup `TRPCProvider` wrapping `<Outlet />` with `queryClient` retrieved via `Route.useRouteContext()`.
- Removed standard UI wrapper shell (Headers/Footers), opting for a minimal Tailwind CSS layout on `body` and `main`.
- Devtools (`TanStackRouterDevtools` and `ReactQueryDevtools`) conditionally injected using `import.meta.env.DEV` conditional block without needing lazy loading per constraints.
- Included Vite asset parameter `?url` to correctly obtain `app.css`'s URL for injection into `<head>`.

## `apps/web/src/routes/login.tsx` Creation
- Used `@ts-expect-error` to suppress TanStack Router `FileRoutesByPath` type errors for newly created routes (`/login` and `/app`) since `routeTree.gen.ts` updates out-of-band.
- Integrated `arktype` v2 validators seamlessly with TanStack Form v1 via the `onChange: ({ value }) => schema.allows({ prop: value }) ? undefined : 'error'` pattern.
- Used inline state (`useState`) to catch and display `better-auth` errors rather than a global toast notification.
- Imported shadcn components exclusively from their explicit `@/components/ui/*` paths to adhere to the no-barrel-exports policy.

### TanStack Router Auth Guard & Form Setup
- TanStack Router loader functions can check better-auth server-side sessions using `auth.api.getSession({ headers })` with `getRequestHeaders()` from `@tanstack/react-start/server`.
- When strict routing is enabled and a route is new, using `as any` in `createFileRoute` and `redirect({ to: ... })` is a practical workaround until the route tree generator runs.
- `useTRPC()` proxies from `@/integrations/trpc/react` integrate cleanly with TanStack Query's `useMutation`.
- TanStack Form v1 validators expect specific object structures. Validating a single field with `arktype` against the whole schema object works nicely (e.g., `labelSchema.allows({ label: value })`).
