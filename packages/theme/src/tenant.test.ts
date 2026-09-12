import { describe, it, expect } from 'vitest';
import { createThemeRegistry, resolveTheme, CELESTIAL_THEME, THEME_SCHEMA_VERSION } from './index';

describe('Tenant theme profiles', () => {
  const registry = createThemeRegistry([CELESTIAL_THEME]);

  it('applies valid tenant slot overrides', () => {
    const resolved = resolveTheme(registry, {
      themeId: 'celestial',
      mode: 'light',
      tenantProfile: {
        tenantId: 'acme-corp',
        baseThemeId: 'celestial',
        schemaVersion: THEME_SCHEMA_VERSION,
        modePreference: 'system',
        slots: {
          brand: {
            'action.primary.background': '{color.blue.700}',
          },
        },
      },
    });

    expect(resolved.validation.isValid).toBe(true);
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1D4ED8');
  });

  it('rejects invalid tenant profile at resolve time', () => {
    expect(() =>
      resolveTheme(registry, {
        themeId: 'celestial',
        mode: 'light',
        tenantProfile: {
          tenantId: '',
          baseThemeId: 'celestial',
          schemaVersion: THEME_SCHEMA_VERSION,
          slots: {
            brand: { 'action.primary.background': '{color.blue.700}' },
          },
        },
      }),
    ).toThrow(/Tenant profile validation failed/);
  });

  it('rejects forbidden tenant override on space foundation', () => {
    expect(() =>
      resolveTheme(registry, {
        themeId: 'celestial',
        mode: 'light',
        tenantProfile: {
          tenantId: 'acme-corp',
          baseThemeId: 'celestial',
          schemaVersion: THEME_SCHEMA_VERSION,
          slots: {
            density: { 'space.1': '8px' },
          },
        },
      }),
    ).toThrow(/Tenant profile validation failed/);
  });
});
