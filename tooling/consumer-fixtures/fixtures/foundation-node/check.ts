import { CELESTIAL_THEME, createThemeRegistry, resolveTheme } from '@celestial-ui/theme';
import { compileThemeSet } from '@celestial-ui/styles';
import { getCanonicalTokenSources } from '@celestial-ui/tokens';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const registry = createThemeRegistry([CELESTIAL_THEME]);
const resolved = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
const css = compileThemeSet([resolved], { scope: { kind: 'document' } });

if (!css.cssText.includes('--cui-primary')) {
  throw new Error('compiled CSS missing --cui-primary');
}

const sources = getCanonicalTokenSources();
if (!sources.primitives || !sources.modes.light) {
  throw new Error('canonical token sources unavailable from packed tarball');
}

const cssPath = require.resolve('@celestial-ui/styles/css');
if (!fs.existsSync(cssPath)) {
  throw new Error(`styles/css export missing at ${cssPath}`);
}

console.log('foundation-node consumer OK');
