---
name: npjc-branching
description: Branching strategy for no-picture-just-chat — GitHub Flow workflow with Git Flow branch naming (the "Conventional Branch" hybrid). Use when creating, naming, or pushing branches in this project. Triggers on "branch", "new branch", "git checkout -b", "branch name", "rename branch", "feature branch", "hotfix".
---

# NPJC Branching Strategy

**Workflow**: GitHub Flow — short-lived branches off `main`, PR + review, squash-merge back to `main`.
**Naming**: Git Flow prefixes — formalized by the [Conventional Branch spec](https://conventional-branch.github.io/).

There is **no `develop` branch**. All work branches off `main`.

## Branch Pattern (enforced by `pre-push` hook)

```
^(main|(feature|bugfix|hotfix|chore|docs|refactor|release)/[a-z0-9._-]+)$
```

Pushing a branch whose name doesn't match this pattern is rejected locally.

## Allowed Prefixes

| Prefix      | Purpose                            | Example                         |
| ----------- | ---------------------------------- | ------------------------------- |
| `feature/`  | New features, enhancements         | `feature/add-oauth2`            |
| `bugfix/`   | Non-critical bug fixes             | `bugfix/fix-login-redirect`     |
| `hotfix/`   | Critical production fixes          | `hotfix/auth-bypass`            |
| `chore/`    | Maintenance, deps, tooling         | `chore/upgrade-eslint`          |
| `docs/`     | Documentation only                 | `docs/update-readme`            |
| `refactor/` | Code restructuring (no behavior Δ) | `refactor/extract-auth-service` |
| `release/`  | Release preparation (rare)         | `release/0.1.0`                 |

## Rules

1. **Branch off `main`**. Always. `git fetch && git checkout -b <name> origin/main`.
2. **Slug format**: lowercase a–z, 0–9, `.`, `_`, `-`. No spaces, no uppercase, no slashes beyond the prefix.
3. **Keep short-lived**: aim for ≤ 1 week from branch to merge.
4. **Descriptive**: `feature/add-oauth-login`, not `feature/stuff`, `feature/wip`, or `feature/fix`.
5. **Ticket prefixes are allowed**: `feature/npjc-42-add-auth` is valid.
6. **No direct push to `main`**: go via PR. Repo settings should also enforce this server-side.

## Canonical Workflow

```bash
# 1. Sync main and branch off
git checkout main
git pull --ff-only
git checkout -b feature/add-oauth-login

# 2. Commit (commit-msg hook enforces Conventional Commits)
git commit -m "feat(auth): add OAuth login handler"

# 3. Push (pre-push hook validates branch name)
git push -u origin feature/add-oauth-login

# 4. Open PR — assignee = self, squash-merge only
gh pr create --assignee @me --title "feat(auth): add OAuth login"
```

## Hook Enforcement

- **pre-push** → `branch-name` command in `lefthook.yml`. Rejects non-matching names with a readable error.
- **Bypass**: `LEFTHOOK=0 git push ...` (discouraged).
- **Fallback**: Server-side branch protection on `main` in GitHub settings (recommended to add).

## Renaming an Auto-generated Branch (MANDATORY for agents)

AI-coding-agent tools create default branch names that violate this project's `pre-push` pattern. Currently
observed patterns:

| Agent    | Auto-generated pattern |
| -------- | ---------------------- |
| OpenCode | `opencode/<slug>`      |
| Codex    | `codex/<slug>`         |

Detection regex:

```
^(opencode|codex)/.+$
```

**Rule**: if `git branch --show-current` matches this regex, the agent **MUST** rename the branch before
attempting any `git push`. The local `pre-push` hook will reject the push otherwise, and server-side CI
never sees un-pushed branches.

### Procedure

1. Detect: `git branch --show-current | grep -Eq '^(opencode|codex)/.+$'`
2. Analyze `git status` + `git diff origin/main` + recent commit messages to infer a descriptive slug.
3. Pick the correct Conventional Branch prefix:
   `feature/`, `bugfix/`, `hotfix/`, `chore/`, `docs/`, `refactor/`, `release/`.
4. Rename locally:

   ```bash
   git branch -m <prefix>/<descriptive-slug>
   ```

5. Verify against the project regex:

   ```bash
   git branch --show-current | grep -Eq '^(main|(feature|bugfix|hotfix|chore|docs|refactor|release)/[a-z0-9._-]+)$'
   ```

6. Push: `git push -u origin <prefix>/<descriptive-slug>`.

### Automated name generation

The user-level `git-flow-branch-creator` skill analyzes staged/committed changes and produces a Conventional
Branch name automatically. Prefer it when the slug is non-obvious.

### Recovery if already pushed

If the auto-generated branch was pushed to the remote (should be impossible — the `pre-push` hook rejects
it — but included for completeness):

```bash
# After the correctly-named branch exists on remote:
git push origin --delete <old-auto-generated-name>
```

## Merging

- **Strategy**: **Squash merge only** (single commit per PR on `main`).
- **Commit on `main`**: PR title (must follow Conventional Commits — see `npjc-commits`).
- **Result**: Linear, semantic history on `main`; no stale branches.

## Why This Hybrid

- **GitHub Flow**: continuous delivery, no stale `develop` / `release` maintenance burden.
- **Git Flow naming**: semantic prefix makes branch intent visible in `git branch`, PR lists, and CI logs.
- **Formalized by [Conventional Branch](https://conventional-branch.github.io/)**: inspired by Conventional Commits, same philosophy.

## Reference

- Spec: <https://conventional-branch.github.io/>
- Pattern enforcement: `lefthook.yml` → `pre-push` → `branch-name`
- Related skill: `git-flow-branch-creator` (auto-generate branch names from diff)
- Related skill: `npjc-commits` (commit message rules)
- Related skill: `npjc-pull-requests` (PR authoring)
