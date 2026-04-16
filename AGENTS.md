# Export Policy

## No Barrel Exports

Barrel exports and catch-all `index` re-export files are prohibited throughout this repository. This rule applies to all source packages and shared configuration packages.

Do not create `index.js`, `index.ts`, or any other entry point files that primarily serve to re-export members from other files within the same directory or package.

### Rationale

Explicit subpath exports are preferred over barrel patterns for the following reasons:

- **Tree-shaking Efficiency**: Tools can more easily identify and include only the necessary code, reducing bundle sizes.
- **IDE Discoverability**: Explicit paths provide clearer navigation and auto-completion behavior in editors.
- **Intentional Public APIs**: Requiring explicit exports forces developers to consciously decide which parts of a package are public.
- **Tool-specific Imports**: Prevents loading unnecessary configurations or dependencies when only a specific subpath is needed (e.g., loading an ESLint config without triggering Prettier or Vite dependencies).

---

# Shared Config Package

## Package: `@h82/no-picture-just-chat-config` (`packages/config`)

The workspace has one internal shared config package. Key facts for agents:

- **6 subpath exports**: `./eslint`, `./prettier`, `./typescript`, `./vite`, `./vitest`, `./playwright`
- **ESM package** (`"type": "module"`). Root package stays CommonJS — use `.mjs` wrappers at root.
- **JSON subpath** (`./typescript` → `tsconfig.base.json`): dynamic `import()` requires `with { type: 'json' }` attribute in Node.js ≥ 20.
- **No build step** — config files ship as source; no `dist/`.
- **Plugins/tooling in root devDependencies** — `typescript-eslint`, `eslint-config-prettier`, etc. are installed at root and resolved via Yarn node-modules hoisting.
- **`@eslint/js` is not directly available** — use `tseslint.configs.recommended` (which includes JS recommended rules internally).
- **Root consumer pattern**: thin `.mjs` wrappers re-export from package subpaths; `tsconfig.json` uses `"extends"`.
- **No root wrappers for vite/vitest/playwright** until actual consumers (`apps/*`, `e2e/*`) exist.
