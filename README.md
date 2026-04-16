# no-picture-just-chat

A focused monorepo for private development.

## Shared Configuration

The `@h82/no-picture-just-chat-config` package provides a unified set of configurations for:

- eslint
- prettier
- typescript
- vite
- vitest
- playwright

See [packages/config/README.md](./packages/config/README.md) for usage documentation.

### Core Policies

- **Internal-only**: This repository and its packages are private and not intended for public distribution.
- **No Barrel Exports**: Catch-all `index` re-export files are prohibited. Imports must use explicit subpaths.
- **Minimal Root Wrappers**: Configuration wrappers for tools like vite, vitest, and playwright are only added when consumers exist.
