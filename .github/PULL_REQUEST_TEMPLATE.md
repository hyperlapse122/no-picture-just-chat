<!--
Read first: .agents/skills/npjc-pull-requests/SKILL.md

PR title must follow Conventional Commits (becomes main's commit on squash-merge):
    <type>(<optional scope>): <subject>     e.g. feat(config): add lefthook hooks

Fill every section or write `N/A` with a one-line reason. Delete inline guidance
(the italic lines) before submitting.
-->

## Summary

_2–3 sentences: **what** changed and **why**. Not how._

## What changed

_Bullet the functional outcomes, not the file diff. The reviewer already sees the diff._

-
-

## What did NOT change (scope boundary)

_Explicitly list adjacent areas you deliberately left alone. Prevents "while I was here…" creep._

-
-

## Root cause _(bug fixes only)_

_Why the bug existed, not what the symptom was. Link the discovery trace if relevant._

## Verification evidence

_Paste actual commands and **actual output**. No "should work" claims._

```bash
# commands executed
yarn lint
yarn format:check
yarn typecheck
```

```
# paste real output here
```

## Manual QA

_What you personally verified beyond automated checks — and what you did **not**._

- Verified:
- Did **not** verify:

## Risk & blast radius

- **Risk level:** Low / Medium / High
- **Affected areas:**
- **Rollback plan:**

## Self-review

- [ ] **Completeness** — implements the full ask; edge cases considered
- [ ] **Quality** — matches existing patterns; names reflect behavior
- [ ] **Discipline** — no YAGNI additions; no unrelated refactors
- [ ] **Testing** — tests verify behavior (or `N/A` with reason)
- [ ] **Scope** — diff matches PR title and this description
- [ ] **Conventions** — branch name, commits, and PR title all conform to `.agents/skills/npjc-*`
- [ ] **Dependencies** — any new/updated versions verified via `yarn npm info <pkg>` (never LLM memory)

## Linked issue

Closes #
Related #
