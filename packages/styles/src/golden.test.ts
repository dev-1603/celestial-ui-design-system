import { describe, it, expect } from 'vitest';
import { compileResolvedTheme, compileThemeSet } from './compiler';
import {
  resolveCelestialLight,
  resolveCelestialDark,
  resolveAcmeLight,
  resolveAcmeDark,
} from './test/fixtures';

describe('golden output', () => {
  it('celestial light has expected semantic aliases', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    expect(compiled.variables['--cui-primary']).toBe('var(--cui-action-primary-background)');
    expect(compiled.variables['--cui-background']).toBe('var(--cui-surface-canvas)');
    expect(compiled.variables['--cui-radius-md']).not.toBe('var(--cui-radius-md)');
    expect(compiled.metadata.themeId).toBe('celestial');
    expect(compiled.metadata.mode).toBe('light');
  });

  it('celestial dark differs from light in surface canvas', () => {
    const light = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const dark = compileResolvedTheme(resolveCelestialDark(), { scope: { kind: 'document' } });
    expect(light.variables['--cui-surface-canvas']).not.toBe(
      dark.variables['--cui-surface-canvas'],
    );
    expect(light.contentHash).not.toBe(dark.contentHash);
  });

  it('acme light inherits celestial with primary override', () => {
    const celestial = compileResolvedTheme(resolveCelestialLight(), {
      scope: { kind: 'document' },
    });
    const acme = compileResolvedTheme(resolveAcmeLight(), { scope: { kind: 'document' } });
    expect(acme.variables['--cui-action-primary-background']).not.toBe(
      celestial.variables['--cui-action-primary-background'],
    );
  });

  it('sandbox scope produces distinct selector', () => {
    const doc = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const sandbox = compileResolvedTheme(resolveCelestialLight(), {
      scope: { kind: 'sandbox', id: 'preview' },
    });
    expect(sandbox.selector).toContain('data-cui-sandbox="preview"');
    expect(sandbox.selector).not.toBe(doc.selector);
  });

  it('theme set hash is stable', () => {
    const a = compileThemeSet([resolveCelestialLight(), resolveCelestialDark()], {
      scope: { kind: 'document' },
    });
    const b = compileThemeSet([resolveCelestialLight(), resolveCelestialDark()], {
      scope: { kind: 'document' },
    });
    expect(a.contentHash).toBe(b.contentHash);
  });

  it('acme dark compiles successfully', () => {
    const compiled = compileResolvedTheme(resolveAcmeDark(), { scope: { kind: 'document' } });
    expect(compiled.metadata.themeId).toBe('acme');
    expect(compiled.metadata.mode).toBe('dark');
    expect(Object.keys(compiled.variables).length).toBeGreaterThan(50);
  });
});
