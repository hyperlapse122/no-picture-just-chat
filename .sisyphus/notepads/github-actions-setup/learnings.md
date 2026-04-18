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
