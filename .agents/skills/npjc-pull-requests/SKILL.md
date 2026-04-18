---
name: npjc-pull-requests
description: How to author and review pull requests for no-picture-just-chat. Use when creating, updating, or reviewing PRs — `gh pr create`, opening a PR, writing PR body, responding to review. Triggers on "pr", "pull request", "gh pr", "create pr", "open pr", "review pr", "merge pr".
---

# NPJC Pull Request Authoring

PRs are **squash-merged**. The PR title becomes the commit message on `main`, so titles must follow Conventional Commits.

Most PRs in this project are authored by AI agents and reviewed by humans. The template and conventions below are tuned for that reality — they force agents to be explicit about scope, verification, and uncertainty.

## PR Title

Same rules as `npjc-commits`:

```
<type>(<optional scope>): <subject>
```

Examples:

- `feat(auth): add OAuth2 login`
- `fix(config): align shared eslint and tsconfig setup`
- `chore(deps): bump prettier to 3.9`
- `docs: update AGENTS.md with branching policy`

## PR Body — every section matters

Use `.github/PULL_REQUEST_TEMPLATE.md`. Fill every section, or write `N/A` with a one-line reason. Delete the italic inline guidance before submitting.

| Section                                  | Purpose                                                                            | AI anti-pattern it prevents         |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| **Summary**                              | 2–3 sentences: what & why, not how                                                 | Bury the lede in file-level detail  |
| **What changed**                         | Functional bullets, not diff recap                                                 | Pasting the diff back               |
| **What did NOT change (scope boundary)** | Explicit list of untouched adjacent areas                                          | "While I was here…" scope creep     |
| **Root cause** _(fixes only)_            | Why the bug existed, not the symptom                                               | Patching symptoms without causality |
| **Verification evidence**                | Actual commands + actual output                                                    | "Should work" claims                |
| **Manual QA**                            | What you personally verified + **what you did not verify**                         | Silent assumptions                  |
| **Risk & blast radius**                  | Low/Medium/High + affected areas + rollback plan                                   | "Small PR" rationalization          |
| **Self-review**                          | Completeness / Quality / Discipline / Testing / Scope / Conventions / Dependencies | Skipped reflection                  |
| **Linked issue**                         | `Closes #N` / `Related #N`                                                         | Orphan work                         |

## Hard Rules for AI-authored PRs

1. **NEVER** claim "should work" without running it. Paste real output.
2. **NEVER** paste the diff in the PR body. Reviewer already sees the diff.
3. **ALWAYS** list things you did **not** verify (forces honesty).
4. **NEVER** bundle unrelated changes. Split into separate PRs.
5. **NEVER** mark self-review checkboxes without actually reviewing.
6. **ALWAYS** verify new/updated dependency versions via `yarn npm info <pkg>` (LLM memory is stale — see `npjc-dependencies`).
7. **ALWAYS** ensure `yarn lint && yarn format:check && yarn typecheck` pass before opening.

## Authoring Flow

```bash
# 1. Verify the branch + commits follow conventions
git log --oneline origin/main..HEAD
git branch --show-current   # must match npjc-branching pattern

# 2. Run local checks (matches what CI will run)
yarn lint
yarn format:check
yarn typecheck

# 3. Push (pre-push hook validates branch name)
git push -u origin "$(git branch --show-current)"

# 4. Open PR — assignee = self
gh pr create --assignee @me \
  --title "<type>(<scope>): <subject>" \
  --body "$(cat <<'EOF'
## Summary
...
EOF
)"

# 5. Confirm title matches Conventional Commits
gh pr view --json title --jq .title
```

## After Opening

- Address every reviewer/bot comment — reply with action taken OR explicit dismissal reason.
- Keep the PR focused. New scope → new branch + new PR.
- On approval: **squash-merge only**. The PR title becomes `main`'s commit message.

## Anti-patterns (reject these in review)

| Anti-pattern                                               | Why it's wrong                            | Fix                                      |
| ---------------------------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| "This PR makes the following changes: [every file listed]" | Diff already shows files                  | Bullet the functional outcomes           |
| "Added tests for the new feature"                          | Vague, no evidence                        | Paste test output                        |
| "Should be backwards-compatible"                           | Unverified claim                          | State what you tested + what you didn't  |
| "While I was here, I also refactored X"                    | Scope creep                               | Separate PR                              |
| Empty "What did NOT change" section                        | No boundary-awareness                     | List adjacent untouched areas explicitly |
| Self-review boxes all checked in < 1 second                | Not actually reviewed                     | Review each dimension before checking    |
| "Bumped package X to latest"                               | Version may be wrong; LLM memory is stale | Cite exact version from `yarn npm info`  |

## Reference

- Template: `.github/PULL_REQUEST_TEMPLATE.md`
- Title format: `npjc-commits` skill
- Branching: `npjc-branching` skill
- Dependencies: `npjc-dependencies` skill
- Root AGENTS.md → Development Workflow → Pull Requests
