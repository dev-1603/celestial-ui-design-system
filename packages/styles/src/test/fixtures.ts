import {
  createThemeRegistry,
  resolveTheme,
  CELESTIAL_THEME,
  defineTheme,
  THEME_SCHEMA_VERSION,
  type ThemeConfig,
} from '@celestial-ui/theme';

export const ACME_THEME: ThemeConfig = {
  id: 'acme',
  name: 'Acme',
  version: '1.0.0',
  schemaVersion: THEME_SCHEMA_VERSION,
  parentId: 'celestial',
  defaultMode: 'light',
  modes: ['light', 'dark'],
  overrides: {
    'action.primary.background': '{color.blue.700}',
  },
};

export function createTestRegistry() {
  return createThemeRegistry([CELESTIAL_THEME, defineTheme(ACME_THEME)]);
}

export function resolveCelestialLight() {
  return resolveTheme(createTestRegistry(), { themeId: 'celestial', mode: 'light' });
}

export function resolveCelestialDark() {
  return resolveTheme(createTestRegistry(), { themeId: 'celestial', mode: 'dark' });
}

export function resolveAcmeLight() {
  return resolveTheme(createTestRegistry(), { themeId: 'acme', mode: 'light' });
}

export function resolveAcmeDark() {
  return resolveTheme(createTestRegistry(), { themeId: 'acme', mode: 'dark' });
}

export { CELESTIAL_THEME, THEME_SCHEMA_VERSION };
