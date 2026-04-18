// Commit message linter — enforces Conventional Commits 1.0.0.
//
// Executed by lefthook's `commit-msg` hook on every `git commit`.
// See `.agents/skills/npjc-commits/SKILL.md` for full conventions.
//
// Spec: https://www.conventionalcommits.org/en/v1.0.0/
// Rules reference: https://commitlint.js.org/reference/rules

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Header: `<type>(<scope>): <subject>` — keep short, scannable.
    'header-max-length': [2, 'always', 72],
    // Scope is optional; when present, must be lowercase.
    'scope-case': [2, 'always', 'lower-case'],
  },
  helpUrl:
    'Commit messages must follow Conventional Commits 1.0.0. ' +
    'See .agents/skills/npjc-commits/SKILL.md or https://www.conventionalcommits.org',
};

export default config;
