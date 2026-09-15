import { describe, it, expect } from 'vitest';
import {
  buildTokenConfigForMode,
  flattenTokens,
  getCanonicalTokenSources,
} from '@celestial-ui/tokens';
import {
  createThemeRegistry,
  defineTheme,
  resolveTheme,
  validateThemeConfig,
  CELESTIAL_THEME,
  ThemeResolutionError,
} from './index';
import { ACME_NEXUS_THEME, ACME_THEME } from './fixtures';

function catalogFlat() {
  return flattenTokens(buildTokenConfigForMode(getCanonicalTokenSources(), 'light'));
}

describe('Theme inheritance', () => {
  it('merges inherited theme overrides along the chain', () => {
    const registry = createThemeRegistry([CELESTIAL_THEME, ACME_THEME, ACME_NEXUS_THEME]);
    const resolved = resolveTheme(registry, { themeId: 'acme-nexus', mode: 'light' });

    expect(resolved.validation.isValid).toBe(true);
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1D4ED8');
    expect(resolved.tokens['action.primary.hover']?.$value).toBe('#1E40AF');
  });

  it('rejects two-node inheritance cycle', () => {
    const cyclicA = defineTheme({ ...ACME_THEME, id: 'cycle-a', parentId: 'cycle-b' });
    const cyclicB = defineTheme({ ...ACME_THEME, id: 'cycle-b', parentId: 'cycle-a' });
    const registry = createThemeRegistry([CELESTIAL_THEME, cyclicA, cyclicB]);
    expect(() => registry.getInheritanceChain('cycle-a')).toThrow(/cycle/i);
  });

  it('rejects multi-node inheritance cycle', () => {
    const a = defineTheme({ ...ACME_THEME, id: 'c-a', parentId: 'c-c' });
    const b = defineTheme({ ...ACME_THEME, id: 'c-b', parentId: 'c-a' });
    const c = defineTheme({ ...ACME_THEME, id: 'c-c', parentId: 'c-b' });
    const registry = createThemeRegistry([CELESTIAL_THEME, a, b, c]);
    expect(() => registry.getInheritanceChain('c-b')).toThrow(/cycle/i);
  });

  it('rejects self-parent at validation', () => {
    const selfParent = defineTheme({ ...ACME_THEME, id: 'self', parentId: 'self' });
    const registry = createThemeRegistry([CELESTIAL_THEME]);
    const report = validateThemeConfig(registry, selfParent, catalogFlat());
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('THEME_PARENT_SELF');
  });

  it('rejects missing parent at validation', () => {
    const orphan = defineTheme({ ...ACME_THEME, id: 'orphan', parentId: 'missing' });
    const registry = createThemeRegistry([CELESTIAL_THEME]);
    const report = validateThemeConfig(registry, orphan, catalogFlat());
    expect(report.isValid).toBe(false);
    expect(report.errors[0]?.code).toBe('THEME_PARENT_MISSING');
  });

  it('allows valid theme override on permitted path', () => {
    const registry = createThemeRegistry([CELESTIAL_THEME, ACME_THEME]);
    const resolved = resolveTheme(registry, { themeId: 'acme', mode: 'light' });
    expect(resolved.tokens['action.primary.background']?.$value).toBe('#1D4ED8');
  });

  it('rejects forbidden theme override at resolve time', () => {
    const locked = defineTheme({
      ...ACME_THEME,
      id: 'locked-override',
      overrides: { 'space.1': '8px' },
    });
    const registry = createThemeRegistry([CELESTIAL_THEME, locked]);
    expect(() => resolveTheme(registry, { themeId: 'locked-override', mode: 'light' })).toThrow(
      ThemeResolutionError,
    );
  });

  it('rejects duplicate theme registration', () => {
    const registry = createThemeRegistry([CELESTIAL_THEME]);
    expect(() => registry.register(CELESTIAL_THEME)).toThrow(/already registered/i);
  });
});
