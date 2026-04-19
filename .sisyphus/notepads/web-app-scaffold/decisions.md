# Decisions — web-app-scaffold

## 2026-04-20 Session Start

### Scope decisions (per Metis review in plan)
- T1 pre-completed (branch already renamed)
- Scaffold in temp dir then curate to apps/web/ — NOT direct scaffold
- Two Neon URLs required: pooled (app) + direct (migrations)
- TS overrides at app level only: verbatimModuleSyntax=false, exactOptionalPropertyTypes=false
- Port 3000 pinned across dev, Playwright webServer, curl QA
- staleTime: 60_000 for SSR prefetch correctness
- demo_items: single app table (one app table only per Metis)
- No barrel exports anywhere
- shadcn components: ONLY button, card, form, input, label (5 total)

## 2026-04-20 T10 — Drizzle setup

- Added `apps/web/drizzle.config.ts` with explicit schema array and `DATABASE_URL_DIRECT`-first migration credentials.
- Added `apps/web/src/db/client.ts` using `drizzle-orm/postgres-js` + `postgres` with `prepare: false`.
