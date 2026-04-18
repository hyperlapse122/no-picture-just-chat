---
name: npjc-commits
description: How to write commit messages for the no-picture-just-chat monorepo. Use when making any git commit in this project — formulating commit text, staging commits, or reviewing commit history. Triggers on "commit", "git commit", "commit message", "write commit", "squash", "amend".
---

# NPJC Commit Message Convention

This project uses **[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)** enforced by `@commitlint/cli` via the `commit-msg` lefthook.

## Format

```
<type>(<optional scope>): <subject>

[optional body — wrap at 72 chars, explain *why* not *what*]

[optional footer(s) — e.g. BREAKING CHANGE:, Refs: #123]
```

## Enforced Rules

| Rule                | Value                                                                              | Source                          |
| ------------------- | ---------------------------------------------------------------------------------- | ------------------------------- |
| `type-enum`         | `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert` | config-conventional             |
| `type-case`         | lower-case                                                                         | config-conventional             |
| `type-empty`        | never empty                                                                        | config-conventional             |
| `subject-case`      | never sentence-case / start-case / pascal-case / upper-case                        | config-conventional             |
| `subject-empty`     | never empty                                                                        | config-conventional             |
| `subject-full-stop` | no trailing period                                                                 | config-conventional             |
| `header-max-length` | **≤ 72 chars**                                                                     | `commitlint.config.js` override |
| `scope-case`        | lower-case                                                                         | `commitlint.config.js` override |

No `scope-enum` is set — new scopes are accepted without config change.

## Type Semantics

| Type       | Use for                                                                |
| ---------- | ---------------------------------------------------------------------- |
| `feat`     | New user-facing feature or capability                                  |
| `fix`      | Bug fix (behavior that was wrong is now right)                         |
| `docs`     | Documentation only — README, AGENTS.md, JSDoc, skills, inline comments |
| `style`    | Formatting, whitespace, import order (no logic change)                 |
| `refactor` | Restructure without behavior change                                    |
| `perf`     | Performance improvement                                                |
| `test`     | Adding, updating, or fixing tests                                      |
| `build`    | Build system, toolchain, dependencies (yarn, tsconfig, vite, vitest)   |
| `ci`       | CI/CD configuration — GitHub Actions, lefthook, commitlint             |
| `chore`    | Maintenance not covered above (e.g., rename file, move directory)      |
| `revert`   | Revert a prior commit — body should contain `Reverts <commit-hash>`    |

## Scope Guidance

- **Optional.** Omit for repo-wide changes.
- **Lowercase** (enforced).
- **Recommended values**: `config` (packages/config), `root`, `deps`, `tooling`, `docs`, or a future workspace name (`app-web`, `e2e-smoke`).
- **Open**: `scope-enum` is intentionally unset; pick the smallest accurate noun.

## Subject Guidance

- Imperative mood: `add`, `fix`, `remove` — **not** `added` / `fixed` / `removing`.
- No trailing period.
- Keep the whole header ≤ 72 characters.
- Describe the **outcome**, not the implementation detail.

## Breaking Changes

Append `!` after type/scope **and** include a `BREAKING CHANGE:` footer:

```
feat(api)!: drop v1 endpoints

BREAKING CHANGE: v1 REST endpoints removed. Migrate callers to /v2.
```

## Examples

```text
feat(config): add lefthook and commitlint
fix(config): align shared eslint and tsconfig setup
docs: expand AGENTS.md project guidance
chore(deps): update all dependencies
refactor(config): migrate root tool wrappers to js files
ci: add pre-commit formatting and branch-name guard
build(deps): bump prettier to 3.9
```

## Anti-patterns

| Wrong                                                                               | Why                                    |
| ----------------------------------------------------------------------------------- | -------------------------------------- |
| `feat: Added authentication.`                                                       | Capital A, past tense, trailing period |
| `Fix: typo`                                                                         | Uppercase type                         |
| `[FEAT] add login`                                                                  | Not Conventional Commits format        |
| `feat(Config): ...`                                                                 | Uppercase scope                        |
| `feat: implement user registration API endpoint with JWT-based authentication flow` | > 72 chars                             |
| `update stuff`                                                                      | Missing type, vague subject            |

## Enforcement

- **Hook**: `lefthook.yml` → `commit-msg` → runs `yarn commitlint --edit {1}` on every commit.
- **Bypass**: `LEFTHOOK=0 git commit ...` (discouraged; PR title is also re-checked).
- **Config**: `commitlint.config.js` at repo root.

## PR Title Relationship

This project squash-merges PRs. The **PR title** becomes the commit message on `main`, so PR titles must follow the same rules. See the `npjc-pull-requests` skill.

## Reference

- Spec: <https://www.conventionalcommits.org/en/v1.0.0/>
- Commitlint rules: <https://commitlint.js.org/reference/rules>
- Root config: `commitlint.config.js`
- Hook definition: `lefthook.yml` → `commit-msg`
