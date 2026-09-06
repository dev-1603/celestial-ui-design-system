import { describe, it, expect } from 'vitest';
import {
  createThemeRegistry,
  resolveTheme,
  CELESTIAL_THEME,
  THEME_SCHEMA_VERSION,
  ThemeResolutionError,
} from './index';
import { ACME_NEXUS_THEME, ACME_THEME } from './fixtures';

describe('Layer collision and precedence', () => {
  const registry = createThemeRegistry([CELESTIAL_THEME, ACME_THEME, ACME_NEXUS_THEME]);

  it('applies celestial → acme → acme-nexus → dark → tenant with deterministic precedence', () => {
    const resolved = resolveTheme(registry, {
      themeId: 'acme-nexus',
      mode: 'dark',
      includeProvenance: true,
      tenantProfile: {
        tenantId: 'acme-corp',
        baseThemeId: 'acme-nexus',
        schemaVersion: THEME_SCHEMA_VERSION,
        slots: {
          brand: { 'action.primary.background': '{color.blue.800}' },
        },
      },
    });

    expect(resolved.mode).toBe('dark');
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1E40AF');
    expect(resolved.tokens['action.primary.hover']?.$value).toBe('#1E40AF');
    expect(resolved.provenance?.['action.primary.background']).toEqual({
      source: 'tenant',
      sourceId: 'acme-corp',
    });
    expect(resolved.provenance?.['action.primary.hover']).toEqual({
      source: 'theme',
      sourceId: 'acme-nexus',
    });
  });

  it('tenant cannot override locked foundation token', () => {
    expect(() =>
      resolveTheme(registry, {
        themeId: 'celestial',
        mode: 'light',
        tenantProfile: {
          tenantId: 'bad-tenant',
          baseThemeId: 'celestial',
          schemaVersion: THEME_SCHEMA_VERSION,
          slots: {
            density: { 'space.1': '8px' },
          },
        },
      }),
    ).toThrow(ThemeResolutionError);
  });

  it('tenant cannot override focus tokens', () => {
    expect(() =>
      resolveTheme(registry, {
        themeId: 'celestial',
        mode: 'light',
        tenantProfile: {
          tenantId: 'bad-tenant',
          baseThemeId: 'celestial',
          schemaVersion: THEME_SCHEMA_VERSION,
          slots: {
            color: { 'focus.color': '{color.red.500}' },
          },
        },
      }),
    ).toThrow(ThemeResolutionError);
  });

  it('leaf theme wins over parent for same token path', () => {
    const parent = {
      ...ACME_THEME,
      id: 'parent-brand',
      overrides: { 'action.primary.background': '{color.blue.600}' },
    };
    const child = {
      ...ACME_NEXUS_THEME,
      id: 'child-brand',
      parentId: 'parent-brand',
      overrides: { 'action.primary.background': '{color.blue.700}' },
    };
    const chainRegistry = createThemeRegistry([CELESTIAL_THEME, parent, child]);
    const resolved = resolveTheme(chainRegistry, { themeId: 'child-brand', mode: 'light' });
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1D4ED8');
  });
});
