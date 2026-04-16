#!/usr/bin/env node
// Validates that all @h82/no-picture-just-chat-config subpath exports resolve correctly.

// JSON subpaths require the `with { type: 'json' }` import attribute in ESM.
const jsonSubpaths = new Set(['@h82/no-picture-just-chat-config/typescript']);

const subpaths = [
  '@h82/no-picture-just-chat-config/eslint',
  '@h82/no-picture-just-chat-config/prettier',
  '@h82/no-picture-just-chat-config/typescript',
  '@h82/no-picture-just-chat-config/vite',
  '@h82/no-picture-just-chat-config/vitest',
  '@h82/no-picture-just-chat-config/playwright',
];

let failed = 0;
for (const subpath of subpaths) {
  try {
    if (jsonSubpaths.has(subpath)) {
      await import(subpath, { with: { type: 'json' } });
    } else {
      await import(subpath);
    }
    console.log(`PASS: ${subpath}`);
  } catch (err) {
    console.error(`FAIL: ${subpath} - ${err.message}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} subpath(s) failed to resolve.`);
  process.exit(1);
}
console.log('\nAll subpaths resolved successfully.');
