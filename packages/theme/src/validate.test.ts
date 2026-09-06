import { describe, it, expect } from 'vitest';
import {
  buildTokenConfigForMode,
  flattenTokens,
  getCanonicalTokenSources,
} from '@celestial-ui/tokens';
import {
  createThemeRegistry,
  defineTheme,
  validateThemeConfig,
  validateTenantThemeProfile,
  CELESTIAL_THEME,
  THEME_SCHEMA_VERSION,
  SLOT_SCHEMA_VERSION,
} from './index';

function catalogFlat() {
  const sources = getCanonicalTokenSources();
  return flattenTokens(buildTokenConfigForMode(sources, 'light'));
}

describe('Theme validation', () => {
  const registry = createThemeRegistry([CELESTIAL_THEME]);
  const flat = catalogFlat();

  it('validates celestial theme config', () => {
    const report = validateThemeConfig(registry, CELESTIAL_THEME, flat);
    expect(report.isValid).toBe(true);
  });

  it('rejects missing default mode', () => {
    const bad = defineTheme({
      ...CELESTIAL_THEME,
      id: 'bad-default',
      defaultMode: 'dark',
      modes: ['light'],
    });
    const report = validateThemeConfig(registry, bad, flat);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('DEFAULT_MODE_INVALID');
  });

  it('rejects unknown token path override', () => {
    const bad = defineTheme({
      ...CELESTIAL_THEME,
      id: 'bad-path',
      overrides: {
        'not.a.real.token': '#000000',
      },
    });
    const report = validateThemeConfig(registry, bad, flat);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('UNKNOWN_TOKEN_PATH');
  });

  it('rejects forbidden override on locked path', () => {
    const bad = defineTheme({
      ...CELESTIAL_THEME,
      id: 'bad-locked',
      overrides: {
        'space.1': '8px',
      },
    });
    const report = validateThemeConfig(registry, bad, flat);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('OVERRIDE_FORBIDDEN');
  });

  it('rejects invalid token type override', () => {
    const bad = defineTheme({
      ...CELESTIAL_THEME,
      id: 'bad-type',
      overrides: {
        'action.primary.background': { $type: 'dimension', $value: '4px' },
      },
    });
    const report = validateThemeConfig(registry, bad, flat);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('INVALID_TOKEN_TYPE');
  });

  it('rejects null override values', () => {
    const bad = defineTheme({
      ...CELESTIAL_THEME,
      id: 'bad-null',
      overrides: {
        'action.primary.background': null as unknown as string,
      },
    });
    const report = validateThemeConfig(registry, bad, flat);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('INVALID_OVERRIDE_VALUE');
  });

  it('rejects incompatible token system version', () => {
    const bad = defineTheme({
      ...CELESTIAL_THEME,
      id: 'future-tokens',
      minTokenSystemVersion: '99.0.0',
    });
    const report = validateThemeConfig(registry, bad, flat);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('TOKEN_SYSTEM_INCOMPATIBLE');
  });

  it('accepts valid tenant brand slot override', () => {
    const report = validateTenantThemeProfile(
      registry,
      {
        tenantId: 't1',
        baseThemeId: 'celestial',
        schemaVersion: THEME_SCHEMA_VERSION,
        slotSchemaVersion: SLOT_SCHEMA_VERSION,
        slots: {
          brand: { 'action.primary.background': '{color.blue.700}' },
        },
      },
      flat,
    );
    expect(report.isValid).toBe(true);
  });

  it('rejects unknown slot id in tenant profile', () => {
    const report = validateTenantThemeProfile(
      registry,
      {
        tenantId: 't1',
        baseThemeId: 'celestial',
        schemaVersion: THEME_SCHEMA_VERSION,
        slots: {
          notARealSlot: { 'action.primary.background': '{color.blue.700}' },
        },
      } as unknown as Parameters<typeof validateTenantThemeProfile>[1],
      flat,
    );
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('UNKNOWN_SLOT');
  });

  it('rejects invalid tenant profile', () => {
    const report = validateTenantThemeProfile(
      registry,
      { tenantId: '', baseThemeId: 'celestial', schemaVersion: THEME_SCHEMA_VERSION },
      flat,
    );
    expect(report.isValid).toBe(false);
    expect(report.errors.some((e) => e.code === 'TENANT_ID_REQUIRED')).toBe(true);
  });

  it('rejects tenant override on locked path', () => {
    const report = validateTenantThemeProfile(
      registry,
      {
        tenantId: 't1',
        baseThemeId: 'celestial',
        schemaVersion: THEME_SCHEMA_VERSION,
        slots: {
          density: { 'space.1': '8px' },
        },
      },
      flat,
    );
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('OVERRIDE_FORBIDDEN');
  });

  it('rejects tenant override on non-approved token in slot', () => {
    const report = validateTenantThemeProfile(
      registry,
      {
        tenantId: 't1',
        baseThemeId: 'celestial',
        schemaVersion: THEME_SCHEMA_VERSION,
        slots: {
          brand: { 'surface.canvas': '{color.blue.700}' },
        },
      },
      flat,
    );
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('OVERRIDE_FORBIDDEN');
  });
});
