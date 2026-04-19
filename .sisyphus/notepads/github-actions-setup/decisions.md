# Decisions

## [2026-04-18] Session start
- Branch name: chore/github-actions-setup (confirmed by user)
- 5 validation jobs: lint, format-check, typecheck, commitlint, pr-title
- commitlint + pr-title gated on: if: github.event_name == 'pull_request'
- PR title piped via env: PR_TITLE (not direct interpolation in run: — security)
- fetch-depth: 0 for all jobs (harmless, needed by commitlint)
- node-version: '24' hardcoded with comment pointing to mise.toml
- corepack enable step included (defensive — ensures yarn shim exists)
- test.yml + deploy.yml: workflow_dispatch only (disabled stubs)
- deploy.yml: cancel-in-progress: false (deploys must serialize)
- No SHA-pinned actions (use @v4, @v5 major tags only)
- No matrix strategies
- Auto-rename rule covers ONLY opencode/ and codex/ — not cursor/, claude/, copilot/
