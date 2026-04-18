---
name: npjc-dependencies
description: How to add, upgrade, or verify npm/yarn dependency versions for no-picture-just-chat. USE WHENEVER you need to know a package's version, latest release, or write a version into package.json — LLM memory is always stale and must be verified via yarn/npm. Triggers on "install", "add dependency", "upgrade", "bump", "latest version", "what version", "yarn add", "npm install", "update deps", "dependency".
---

# NPJC Dependency Version Discovery

**Hard rule: never trust an LLM's memory for package versions.** Always verify via the live registry before writing a version string.

## Why This Rule Exists

LLMs (including me) ship with a training cutoff. "Latest" in the model's head is often 6–18 months behind reality. Concrete examples from this very repo:

- I believed `lefthook` was `1.x`. Actual latest at install time: `2.1.6`.
- I believed `@commitlint/cli` was `19.x`. Actual: `20.5.0`.
- I assumed TypeScript `6` was a typo. It's current.

Using stale versions silently:

1. installs known-vulnerable software,
2. misses breaking changes (e.g. lefthook 1 → 2 config shape),
3. makes the repo look outdated even when freshly set up.

## Mandatory Verification Commands

Before writing any version into `package.json`, run one of these and cite the output.

### Preferred: `yarn npm info`

```bash
# Show the whole manifest (highest-signal)
yarn npm info <pkg>

# Just the version fields
yarn npm info <pkg> versions --json | jq '.[-5:]'      # last 5 published versions
yarn npm info <pkg> version                            # dist-tag 'latest'
yarn npm info <pkg> dist-tags --json                   # latest, next, beta, etc.
```

### Fallback: raw npm registry

```bash
npm view <pkg> version               # dist-tag 'latest'
npm view <pkg> dist-tags --json      # all dist-tags
npm view <pkg> time --json | jq .    # release timestamps (confirm recency)
```

### Cross-check recency

Always sanity-check that "latest" is actually recent:

```bash
yarn npm info <pkg> time --json 2>/dev/null | jq 'to_entries | map(select(.key == "modified" or .key == "created")) | from_entries'
```

If the newest release is > 1 year old, flag it in the PR — the package may be abandoned.

## Install Workflow

```bash
# 1. Discover
yarn npm info <pkg> version

# 2. Decide: accept 'latest' OR pin an older major if needed (with justification)

# 3. Install — let yarn pick, then VERIFY the resolved version
yarn add -D <pkg>
yarn info <pkg> --json | jq -r '.children.Version'

# 4. Cite the resolved version in the commit body and PR body:
#    "lefthook resolved to 2.1.6 (yarn npm info lefthook version → 2.1.6)"
```

## Upgrade Workflow

```bash
# Check what's outdated vs registry
yarn outdated

# Upgrade a single package to its latest
yarn up <pkg>

# Upgrade to the exact 'latest' dist-tag (not semver range)
yarn up <pkg>@latest

# After upgrade, always:
yarn lint && yarn format:check && yarn typecheck
```

## Version Strategy for This Repo

- Caret ranges (`^x.y.z`) for all devDependencies — matches existing pattern.
- **Pin exact** only when a known regression forces it; comment the reason in the commit body.
- Bleeding-edge majors (TypeScript 6, ESLint 10, Vite 8, Vitest 4, lefthook 2, commitlint 20) are **accepted** — this project is in skeleton phase and tracks current releases.
- When a breaking major appears, read the changelog **before** bumping. Don't rely on LLM memory of the previous major's API.

## Anti-patterns

| Anti-pattern                                                     | Why it fails                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| "Latest version of lefthook is around 1.10"                      | LLM memory; actual is 2.x. Always `yarn npm info`.            |
| Writing `"^1.10.4"` directly into `package.json`                 | Skips verification; may pin to deprecated/vulnerable version. |
| Copying `yarn add` from a blog post without checking the version | Blog post may predate breaking changes.                       |
| Leaving a range like `"^0.1.0"` unverified                       | 0.x means any bump may be breaking — verify current actively. |
| "The API hasn't changed" (from memory)                           | You don't know. Read the changelog.                           |

## PR/Commit Disclosure

When adding or upgrading a dependency, include in the commit body **and** PR body:

```
lefthook: 0.0.0 → 2.1.6 (yarn npm info lefthook version → 2.1.6, published YYYY-MM-DD)
@commitlint/cli: 0.0.0 → 20.5.0 (yarn npm info @commitlint/cli version → 20.5.0)
```

This demonstrates you verified rather than guessed.

## Reference

- Yarn npm info: <https://yarnpkg.com/cli/npm/info>
- npm view: <https://docs.npmjs.com/cli/v10/commands/npm-view>
- Related: `npjc-pull-requests` → Self-review "Dependencies" checkbox
