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
