import { describe, it, expect } from 'vitest';
import {
  createThemeRegistry,
  defineTheme,
  resolveTheme,
  CELESTIAL_THEME,
  THEME_SCHEMA_VERSION,
} from './index';

describe('Theme resolution', () => {
  const registry = createThemeRegistry([CELESTIAL_THEME]);

  it('resolves celestial base theme in light mode', () => {
    const resolved = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });

    expect(resolved.themeId).toBe('celestial');
    expect(resolved.mode).toBe('light');
    expect(resolved.validation.isValid).toBe(true);
    expect(resolved.tokens['surface.canvas']?.$value).toBeDefined();
  });

  it('resolves celestial in dark mode', () => {
    const resolved = resolveTheme(registry, { themeId: 'celestial', mode: 'dark' });

    expect(resolved.mode).toBe('dark');
    expect(resolved.validation.isValid).toBe(true);
    expect(resolved.tokens['surface.canvas']?.$value).not.toBe(
      resolveTheme(registry, { themeId: 'celestial', mode: 'light' }).tokens['surface.canvas']
        ?.$value,
    );
  });

  it('uses default mode when mode is omitted', () => {
    const resolved = resolveTheme(registry, { themeId: 'celestial' });
    expect(resolved.mode).toBe('light');
  });

  it('resolves deterministically for identical inputs', () => {
    const a = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
    const b = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });

    expect(a.tokens).toEqual(b.tokens);
    expect(a.schemaVersion).toBe(THEME_SCHEMA_VERSION);
    expect(a.tokenSystemVersion).toBe('0.1.0');
  });

  it('omits provenance by default', () => {
    const resolved = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
    expect(resolved.provenance).toBeUndefined();
  });

  it('includes provenance when requested', () => {
    const resolved = resolveTheme(registry, {
      themeId: 'celestial',
      mode: 'light',
      includeProvenance: true,
    });
    expect(resolved.provenance?.['surface.canvas']).toEqual({
      source: 'mode',
      sourceId: 'light',
    });
  });
});
