# @h82/no-picture-just-chat-config

Shared configuration package for `no-picture-just-chat` tools.

## Usage

This package provides subpath exports for various tools. Consume them by importing or extending the specific subpath.

### ESLint (`./eslint`)

```javascript
import config from '@h82/no-picture-just-chat-config/eslint';
export default config;
```

### Prettier (`./prettier`)

```javascript
import config from '@h82/no-picture-just-chat-config/prettier';
export default config;
```

### TypeScript (`./typescript`)

```json
{
  "extends": "@h82/no-picture-just-chat-config/typescript"
}
```

### Vite (`./vite`)

```javascript
import config from '@h82/no-picture-just-chat-config/vite';
export default config;
```

### Vitest (`./vitest`)

```javascript
import config from '@h82/no-picture-just-chat-config/vitest';
export default config;
```

### Playwright (`./playwright`)

```javascript
import config from '@h82/no-picture-just-chat-config/playwright';
export default config;
```

## Guardrails

- **Private & Internal**: This package is private and intended for internal use within this monorepo only.
- **No Barrel Exports**: Every tool has its own entry point. Do not create `index.js` or `index.ts` files to re-export multiple configurations.
- **Direct Source Shipping**: These configurations are shipped as source files. There is no build step.
- **Lazy Wrapper Creation**: Root configuration wrappers (e.g., for vite/vitest/playwright) should not be created until there are active consumers.
