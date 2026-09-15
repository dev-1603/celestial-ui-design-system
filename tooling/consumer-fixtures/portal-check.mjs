import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { CORE_PACKAGE_VERSION, createDisclosure } from '@celestial-ui/core';
import { createDisclosure as behaviorDisclosure } from '@celestial-ui/core/behavior';
import { buttonSpec } from '@celestial-ui/core/specs/button';
import { flattenTokens } from '@celestial-ui/tokens/resolve';
import { CELESTIAL_THEME } from '@celestial-ui/theme/themes/celestial';
import { createThemeStyleManager } from '@celestial-ui/styles/runtime';
import { resolveIcon } from '@celestial-ui/icons';

const require = createRequire(import.meta.url);

const SUBPATHS = [
  '@celestial-ui/core',
  '@celestial-ui/core/contracts',
  '@celestial-ui/core/behavior',
  '@celestial-ui/core/accessibility',
  '@celestial-ui/core/collection',
  '@celestial-ui/core/overlay',
  '@celestial-ui/core/runtime',
  '@celestial-ui/core/specs/button',
  '@celestial-ui/tokens',
  '@celestial-ui/tokens/resolve',
  '@celestial-ui/tokens/catalog',
  '@celestial-ui/tokens/types',
  '@celestial-ui/tokens/a11y',
  '@celestial-ui/theme',
  '@celestial-ui/theme/themes/celestial',
  '@celestial-ui/theme/resolve',
  '@celestial-ui/theme/registry',
  '@celestial-ui/styles',
  '@celestial-ui/styles/runtime',
  '@celestial-ui/styles/ssr',
  '@celestial-ui/styles/compiler',
  '@celestial-ui/icons',
  '@celestial-ui/icons/providers/lucide',
];

function assertDist(resolved, name) {
  const filePath = resolved.startsWith('file:') ? fileURLToPath(resolved) : resolved;
  const srcNeedle = `${path.sep}src${path.sep}`;
  if (filePath.includes(srcNeedle) || filePath.endsWith(`${path.sep}src`)) {
    throw new Error(`${name} resolved to source: ${filePath}`);
  }
  if (!filePath.includes(`${path.sep}dist${path.sep}`)) {
    throw new Error(`${name} did not resolve through dist: ${filePath}`);
  }
}

for (const name of SUBPATHS) {
  const resolved = import.meta.resolve(name);
  assertDist(resolved, name);
  await import(resolved);
  console.log('resolve', name, '->', resolved);
}

if (!createDisclosure || !behaviorDisclosure || !buttonSpec) {
  throw new Error('core subpath imports returned empty');
}
if (typeof flattenTokens !== 'function') throw new Error('tokens/resolve missing flattenTokens');
if (!CELESTIAL_THEME?.id) throw new Error('theme celestial identity missing');
if (typeof createThemeStyleManager !== 'function') {
  throw new TypeError('styles/runtime missing manager');
}
if (typeof resolveIcon !== 'function') throw new Error('icons missing resolveIcon');

const cjs = require('@celestial-ui/core');
if (!cjs.createDisclosure) throw new Error('CJS require(@celestial-ui/core) failed');
assertDist(require.resolve('@celestial-ui/core'), 'cjs:@celestial-ui/core');

console.log('CORE_PACKAGE_VERSION', CORE_PACKAGE_VERSION);
console.log('portal consumer OK');
