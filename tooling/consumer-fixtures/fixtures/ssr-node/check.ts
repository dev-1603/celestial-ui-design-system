import { createCelestialRuntime, createNullEnvironment } from '@celestial-ui/core';
import { CELESTIAL_THEME, createThemeRegistry, resolveTheme } from '@celestial-ui/theme';
import { compileResolvedTheme, renderThemeStyleTag } from '@celestial-ui/styles';

const runtime = createCelestialRuntime({ environment: createNullEnvironment() });
if (!runtime) {
  throw new Error('runtime creation failed');
}

const registry = createThemeRegistry([CELESTIAL_THEME]);
const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
const compiled = compileResolvedTheme(light, { scope: { kind: 'document' } });
const tag = renderThemeStyleTag(compiled);

if (!tag.includes('<style')) {
  throw new Error('SSR style tag missing');
}

console.log('ssr-node consumer OK');
