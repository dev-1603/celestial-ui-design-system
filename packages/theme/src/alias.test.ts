import { describe, it, expect } from 'vitest';
import {
  createThemeRegistry,
  defineTheme,
  resolveTheme,
  CELESTIAL_THEME,
  ThemeResolutionError,
} from './index';
import { ACME_THEME } from './fixtures';

describe('Alias resolution after overrides', () => {
  const registry = createThemeRegistry([CELESTIAL_THEME, ACME_THEME]);

  it('resolves theme override using alias reference', () => {
    const resolved = resolveTheme(registry, { themeId: 'acme', mode: 'light' });
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1D4ED8');
  });

  it('resolves tenant override using alias reference', () => {
    const resolved = resolveTheme(registry, {
      themeId: 'celestial',
      mode: 'light',
      tenantProfile: {
        tenantId: 'acme-corp',
        baseThemeId: 'celestial',
        schemaVersion: '1.0.0',
        slots: {
          brand: { 'action.primary.background': '{color.blue.700}' },
        },
      },
    });
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1D4ED8');
  });

  it('rejects invalid alias at token validation', () => {
    const bad = defineTheme({
      ...CELESTIAL_THEME,
      id: 'bad-alias',
      overrides: { 'action.primary.background': '{color.does.not.exist}' },
    });
    const badRegistry = createThemeRegistry([CELESTIAL_THEME, bad]);
    expect(() => resolveTheme(badRegistry, { themeId: 'bad-alias', mode: 'light' })).toThrow(
      ThemeResolutionError,
    );
  });

  it('resolves alias to correct primitive value', () => {
    const resolved = resolveTheme(registry, { themeId: 'acme', mode: 'light' });
    expect(resolved.tokens['color.blue.700']?.$value).toBe('#1D4ED8');
    expect(resolved.tokens['action.primary.background']?.$value).toBe(
      resolved.tokens['color.blue.700']?.$value,
    );
  });
});
