# NPJC — No Picture Just Chat

Anonymous BBS system with generative AI. Private monorepo, skeleton phase — shared config package only, no apps yet.

**Generated:** 2026-04-16 · **Commit:** a53ef93 · **Branch:** main

---

# Development Workflow

All workflow rules below are **enforced locally by lefthook** (`lefthook.yml`) and documented in detail by project-local skills under `.agents/skills/`. Load a skill whenever the corresponding trigger applies — skills contain the full rulebook; this section is the overview.

## Commit Messages — Conventional Commits 1.0.0

- **Format**: `<type>(<optional scope>): <subject>`
- **Allowed types**: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`
- **Subject**: imperative mood, lower-case, no trailing period, header ≤ 72 chars
- **Enforced by**: `lefthook.yml` → `commit-msg` → `yarn commitlint --edit {1}`
- **Config**: `commitlint.config.js` (extends `@commitlint/config-conventional`)
- **Full rules**: `.agents/skills/npjc-commits/SKILL.md`

```text
feat(config): add lefthook and commitlint
fix(config): align shared eslint and tsconfig setup
docs: expand AGENTS.md with development workflow
```

## Branching — GitHub Flow + Git Flow naming ("Conventional Branch")

- **Workflow**: short-lived branches off `main`, PR + review, squash-merge to `main`. No `develop` branch.
- **Pattern**: `^(main|(feature|bugfix|hotfix|chore|docs|refactor|release)/[a-z0-9._-]+)$`
- **Enforced by**: `lefthook.yml` → `pre-push` → `branch-name`
- **Full rules**: `.agents/skills/npjc-branching/SKILL.md`
- **Naming helper skill**: `git-flow-branch-creator` (auto-generates names from `git diff`)

```bash
git checkout -b feature/add-oauth-login   # ✓
git checkout -b feat/add-auth              # ✗ rejected by pre-push
git checkout -b opencode/playful-engine    # ✗ rejected by pre-push
```

### Agents on auto-generated branches (MANDATORY rename before push)

If `git branch --show-current` returns a branch matching the regex

```
^(opencode|codex)/.+$
```

(e.g. `opencode/quick-otter`, `codex/refactor-chat`), the agent **MUST** rename it to follow the
Conventional Branch pattern **before any `git push`**. The local `pre-push` hook will reject the push
otherwise, and server-side CI assumes branches already conform.

Procedure:

1. Analyze the current diff + commit history to infer a descriptive slug.
2. Pick the correct prefix (`feature/`, `bugfix/`, `hotfix/`, `chore/`, `docs/`, `refactor/`, `release/`).
3. Rename:

   ```bash
   git branch -m <prefix>/<slug>
   ```

4. Verify: `git branch --show-current` matches the project regex in `lefthook.yml:pre-push`.
5. Push normally: `git push -u origin <prefix>/<slug>`.

If the auto-generated branch was already pushed to the remote (rare — `pre-push` rejects it), delete
the remote ref AFTER the correctly-named branch has been pushed:

```bash
git push origin --delete <old-auto-generated-name>
```

The `git-flow-branch-creator` skill (user-level) can automate the naming step. Full rulebook:
`.agents/skills/npjc-branching/SKILL.md`.

## Pull Requests — squash-merge, template-driven

- **Title**: same Conventional Commits format as commits (becomes `main`'s commit on squash).
- **Body**: fill every section of `.github/PULL_REQUEST_TEMPLATE.md` or write `N/A` with a reason.
- **Required sections**: Summary, What changed, What did NOT change (scope boundary), Verification evidence (actual output), Manual QA (incl. what you did NOT verify), Risk/blast radius, Self-review, Linked issue.
- **Merge strategy**: squash only.
- **Assignee**: self (`gh pr create --assignee @me`).
- **Full rules**: `.agents/skills/npjc-pull-requests/SKILL.md`

## Git Hooks — lefthook

| Hook         | Action                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `pre-commit` | `yarn eslint --fix` then `yarn prettier --write` on staged files (piped: fail-fast, auto-stage fixed) |
| `commit-msg` | `yarn commitlint --edit {1}` — enforces Conventional Commits                                          |
| `pre-push`   | Branch-name regex guard — enforces the branching pattern above                                        |

- **Install**: runs automatically on `yarn install` via the `prepare` script; manual install: `yarn lefthook install`.
- **Bypass** (discouraged): `LEFTHOOK=0 git commit ...` or `lefthook-local.yml` (per-machine, gitignored).
- **Config**: `lefthook.yml` at repo root.

## Dependency Versions — always verify via yarn/npm, never trust LLM memory

LLM-authored changes often cite stale "latest" versions. **Before writing any version into `package.json`**, run one of:

```bash
yarn npm info <pkg> version           # preferred — dist-tag 'latest'
yarn npm info <pkg> dist-tags --json  # all dist-tags
npm view <pkg> version                # fallback
```

- **After `yarn add` / `yarn up`**: verify the resolved version with `yarn info <pkg> --json | jq -r '.children.Version'` and cite it in the commit + PR body.
- **Never** paste a version string from memory, a blog post, or training-data knowledge without re-verifying.
- **Full workflow + anti-patterns**: `.agents/skills/npjc-dependencies/SKILL.md`
- **PR self-review** has a dedicated "Dependencies" checkbox for this.

## Skills Index (project-local, `.agents/skills/`)

| Skill                | Use when…                                                 |
| -------------------- | --------------------------------------------------------- |
| `npjc-commits`       | Writing any commit message                                |
| `npjc-branching`     | Creating, naming, or pushing branches                     |
| `npjc-pull-requests` | Creating, updating, or reviewing PRs                      |
| `npjc-dependencies`  | Adding, upgrading, or citing any npm/yarn package version |

User-level skill `git-flow-branch-creator` pairs with `npjc-branching` to generate branch names from diffs.

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
- **No hook bypass without cause** — don't default to `LEFTHOOK=0` or `--no-verify`; fix the lint/format/commit-msg/branch-name issue instead
- **No version strings from memory** — LLM memory is stale; always `yarn npm info <pkg> version` before writing into `package.json`
- **No squash-commit drift** — PR title = final commit on `main`, so PR titles must follow Conventional Commits

## Commands

```bash
yarn lint              # ESLint (flat config)
yarn format:check      # Prettier check
yarn format            # Prettier write
yarn typecheck         # tsc --noEmit
yarn lefthook install  # (Re)install git hooks — also runs via `prepare` on `yarn install`
yarn commitlint --edit <file>   # Manually lint a commit message
yarn npm info <pkg> version     # Verify latest published version before bumping
```

## Notes

- **No `turbo.json`** — Turborepo orchestration not configured. Add when multiple packages need coordinated builds.
- **Empty workspace globs** — `apps/*` and `e2e/*` defined in workspaces but directories don't exist yet.
- **JSON import attribute** — `with { type: 'json' }` required for TypeScript config import in Node.js ≥ 20.
- **VSCode** — format-on-save with Prettier, ESLint auto-fix on save, flat config enabled.
- **ESLint 10 + flat config** — uses `tseslint.config()` spread pattern with `eslint-config-prettier`.

## CI / GitHub Actions

Three workflows are configured in `.github/workflows/`:

- `validate.yml`: Runs on `main` push, PR (opened/sync/reopened/edited), and `workflow_dispatch`. 5 parallel jobs: `lint`, `format-check`, `typecheck`, `commitlint`, `pr-title`. `commitlint` and `pr-title` are gated to PRs.
- `test.yml`: `workflow_dispatch` stub. No tests currently exist; activates when a `test` script is added.
- `deploy.yml`: `workflow_dispatch` stub with an `environment` input (default: `preview`). Target (Vercel, Cloudflare, etc.) is TBD.

### CI Advisory

- **Node version**: Hardcoded to `24` (matches `mise.toml`) as `setup-node` doesn't read mise config.
- **Composite action candidate**: `validate.yml` has 5 identical setup blocks. Consider `.github/actions/setup/` if jobs increase.
- **Dispatch limitation**: Stub workflows must exist on the default branch (`main`) to be dispatchable via `gh workflow run` without `--ref`. Use `gh workflow run <name> --ref <branch>` during development.
- **Deploy inputs**: `deploy.yml` currently echoes `${{ inputs.environment }}` in a `run` block. Switch to an `env` pattern when wiring a real target.

### Linked Skills

| Skill                | Relevance to CI                                                                   |
| -------------------- | --------------------------------------------------------------------------------- |
| `npjc-commits`       | CI enforces Conventional Commits via `commitlint` job                             |
| `npjc-pull-requests` | PR titles are linted in CI to ensure semantic squash-merges; PR body requirements |
