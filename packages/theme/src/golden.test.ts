import { describe, it, expect } from 'vitest';
import {
  createThemeRegistry,
  resolveTheme,
  CELESTIAL_THEME,
  THEME_SCHEMA_VERSION,
} from './index';
import { ACME_THEME } from './fixtures';

/**
 * Golden resolved values for key tokens.
 * Protects the resolution algorithm from accidental drift.
 */
describe('Golden resolved theme outputs', () => {
  const registry = createThemeRegistry([CELESTIAL_THEME, ACME_THEME]);

  it('Celestial light', () => {
    const resolved = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#2563EB');
    expect(resolved.tokens['surface.canvas']?.$value).toBe('#F9FAFB');
  });

  it('Celestial dark', () => {
    const resolved = resolveTheme(registry, { themeId: 'celestial', mode: 'dark' });
    expect(resolved.tokens['surface.canvas']?.$value).toBe('#030712');
  });

  it('Acme light', () => {
    const resolved = resolveTheme(registry, { themeId: 'acme', mode: 'light' });
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1D4ED8');
    expect(resolved.tokens['surface.canvas']?.$value).toBe('#F9FAFB');
  });

  it('Acme dark', () => {
    const resolved = resolveTheme(registry, { themeId: 'acme', mode: 'dark' });
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1D4ED8');
    expect(resolved.tokens['surface.canvas']?.$value).toBe('#030712');
  });

  it('Acme light + tenant brand override', () => {
    const resolved = resolveTheme(registry, {
      themeId: 'acme',
      mode: 'light',
      tenantProfile: {
        tenantId: 'acme-corp',
        baseThemeId: 'acme',
        schemaVersion: THEME_SCHEMA_VERSION,
        slots: {
          brand: { 'action.primary.background': '{color.blue.800}' },
        },
      },
    });
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1E40AF');
  });
});
