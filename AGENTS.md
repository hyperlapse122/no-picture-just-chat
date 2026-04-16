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
