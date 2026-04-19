# Learnings

## [2026-04-18] Session start
- Current branch: opencode/quick-otter — must rename to chore/github-actions-setup
- packageManager: yarn@4.13.0 with vendored .yarn/releases/yarn-4.13.0.cjs
- nodeLinker: node-modules (no PnP)
- Node version: 24 (from mise.toml)
- Available scripts: lint, format:check, typecheck (from package.json)
- commitlint config: header-max-length:72, scope-case:lower-case, extends @commitlint/config-conventional
- ESM-only project ("type":"module" in root and packages/config)
- No turbo.json — Turborepo not in use
- yq (mikefarah variant, Go-based) needed for YAML assertions in T2-T4 QA
- actionlint needed for static workflow validation in T7
- .sisyphus/evidence/ is per-run scratch — may not be gitignored
## [T1 complete] Branch renamed
- Branch successfully renamed: opencode/quick-otter → chore/github-actions-setup
- yq version: yq (https://github.com/mikefarah/yq/) version v4.53.2 
- actionlint version: 1.7.12 installed by building from source built with go1.26.1 compiler for darwin/arm64 
- Evidence written to .sisyphus/evidence/task-1-*.txt

## [T3 complete] test.yml stub created
- Only workflow_dispatch trigger
- Planned yarn workspaces command stays commented
- Committed: ci(actions): scaffold disabled test workflow stub
## [T4 complete] deploy.yml stub created
- Only workflow_dispatch trigger
- cancel-in-progress: false (deploys serialize)
- TODO comments for deploy target
- No secrets references
- Committed: ci(actions): scaffold disabled deploy workflow stub

## F3 Manual QA findings (2026-04-19)

- `gh pr checks --json=name,bucket` is the canonical field for check state in gh ≥ 2.40: `bucket ∈ {pass, fail, pending, skipping, cancel}`. The older `state` field is not exposed on this command.
- `gh run list --json` uses `conclusion` (success/failure), NOT `bucket`. Do not conflate the two CLIs.
- `workflow_dispatch` trigger: GitHub Actions only accepts dispatch for workflows whose file exists on the **default branch**, even when `--ref` points elsewhere. A `workflow_dispatch`-only stub on a feature branch returns HTTP 404 until merged. validate.yml escapes this because it's also wired to `pull_request`/`push`, which registers it with Actions once it runs naturally on the PR.
- Trigger isolation is observable via `gh run list --branch=<br> --json=name,event,headSha` filtered on the current HEAD sha. For pushes on a pull-request-triggered workflow, expect exactly: Validate-pull_request=1, Validate-push=0, Test=0, Deploy=0.
- `LEFTHOOK=0 git commit --allow-empty -m 'wip'` is the safe probe for the server-side commitlint job — it bypasses the local `commit-msg` hook so the bad message reaches origin and the GH workflow can fail on it.
- `git push --force-with-lease` is the correct restore after a bad-commit probe: it's non-destructive if anyone else pushed (rejects instead of clobbering), and it clears the feature-branch history back to HEAD~1 without touching main.
- When restoring a bad PR title, `gh pr edit --title '<correct>'` triggers a fresh PR check cycle; the pr-title action re-evaluates on every edit.
