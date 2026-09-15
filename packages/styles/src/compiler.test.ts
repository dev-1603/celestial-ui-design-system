import { describe, it, expect } from 'vitest';
import { compileResolvedTheme, compileThemeSet } from './compiler';
import { StyleCompilationError } from './errors';
import { resolveCelestialLight, resolveCelestialDark, resolveAcmeLight } from './test/fixtures';

import { comparePropertyNames } from './serializer';

describe('compiler', () => {
  const defaultOptions = { scope: { kind: 'document' as const } };

  it('compiles celestial light theme deterministically', () => {
    const theme = resolveCelestialLight();
    const a = compileResolvedTheme(theme, defaultOptions);
    const b = compileResolvedTheme(theme, defaultOptions);
    expect(a.contentHash).toBe(b.contentHash);
    expect(a.cssText).toBe(b.cssText);
  });

  it('includes compatibility variables with --cui- prefix', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), defaultOptions);
    expect(compiled.variables['--cui-surface-canvas']).toBeDefined();
    expect(compiled.cssText).toContain('--cui-surface-canvas');
  });

  it('includes stable semantic aliases referencing internal vars', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), defaultOptions);
    expect(compiled.variables['--cui-primary']).toBe('var(--cui-action-primary-background)');
    expect(compiled.variables['--cui-background']).toBe('var(--cui-surface-canvas)');
    expect(compiled.variables['--cui-radius-md']).not.toBe('var(--cui-radius-md)');
    expect(compiled.variables['--cui-surface-subtle']).not.toBe('var(--cui-surface-subtle)');
  });

  it('uses :where() scoped selectors with data attributes', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), defaultOptions);
    expect(compiled.selector).toContain(':where(');
    expect(compiled.selector).toContain('data-cui-theme="celestial"');
    expect(compiled.selector).toContain('data-cui-mode="light"');
    expect(compiled.selector).toContain(':root.light');
    expect(compiled.selector).toContain('.light');
  });

  it('wraps output in @layer celestial.tokens', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), defaultOptions);
    expect(compiled.cssText).toContain('@layer celestial.tokens');
  });

  it('compiles theme set with light and dark modes', () => {
    const compiled = compileThemeSet(
      [resolveCelestialLight(), resolveCelestialDark()],
      defaultOptions,
    );
    expect(compiled.cssText).toContain('data-cui-mode="light"');
    expect(compiled.cssText).toContain('data-cui-mode="dark"');
  });

  it('rejects invalid resolved theme', () => {
    const theme = resolveCelestialLight();
    const invalid = { ...theme, validation: { ...theme.validation, isValid: false } };
    expect(() => compileResolvedTheme(invalid, defaultOptions)).toThrow(StyleCompilationError);
  });

  it('rejects unresolved alias in token map', () => {
    const theme = resolveCelestialLight();
    const bad = {
      ...theme,
      tokens: {
        ...theme.tokens,
        'color.bad': { $type: 'color' as const, $value: '{color.missing}' },
      },
    };
    expect(() => compileResolvedTheme(bad, defaultOptions)).toThrow(StyleCompilationError);
  });

  it('compiles acme theme with inherited overrides', () => {
    const compiled = compileResolvedTheme(resolveAcmeLight(), defaultOptions);
    expect(compiled.metadata.themeId).toBe('acme');
    expect(compiled.variables['--cui-action-primary-background']).toBeDefined();
  });

  it('sorts variables deterministically in CSS output', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), defaultOptions);
    const lines = compiled.cssText.split('\n').filter((l) => l.trim().startsWith('--'));
    const props = lines.map((l) => l.trim().split(':')[0]);
    const sorted = [...props].sort(comparePropertyNames);
    expect(props).toEqual(sorted);
  });

  it('rejects token paths that normalize to the same CSS variable', () => {
    const theme = resolveCelestialLight();
    const colliding = {
      ...theme,
      tokens: {
        ...theme.tokens,
        'foo.bar-baz': { $type: 'color' as const, $value: '#111111' },
        'foo.bar.baz': { $type: 'color' as const, $value: '#222222' },
      },
    };
    expect(() => compileResolvedTheme(colliding, defaultOptions)).toThrow(StyleCompilationError);
  });

  it('inlines semantic values when compatibility variables are omitted', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), {
      ...defaultOptions,
      includeCompatibilityVariables: false,
    });
    expect(compiled.variables['--cui-surface-canvas']).toBeUndefined();
    expect(compiled.variables['--cui-primary']).not.toMatch(/^var\(/);
    expect(compiled.variables['--cui-primary']).toBe(
      compileResolvedTheme(resolveCelestialLight(), defaultOptions).variables[
        '--cui-action-primary-background'
      ],
    );
  });

  it('emits a stable styleId for the compilation scope', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), defaultOptions);
    expect(compiled.styleId).toBe('cui-style-document');
  });

  it('is independent of token object insertion order', () => {
    const theme = resolveCelestialLight();
    const reversed: typeof theme.tokens = {};
    for (const key of Object.keys(theme.tokens).reverse()) {
      reversed[key] = theme.tokens[key]!;
    }
    const shuffled = { ...theme, tokens: reversed };
    expect(compileResolvedTheme(shuffled, defaultOptions).cssText).toBe(
      compileResolvedTheme(theme, defaultOptions).cssText,
    );
  });

  it('does not require a document (server-safe)', () => {
    const original = globalThis.document;
    // @ts-expect-error isolation
    delete globalThis.document;
    try {
      const compiled = compileResolvedTheme(resolveCelestialLight(), defaultOptions);
      expect(compiled.cssText).toContain('--cui-primary');
    } finally {
      globalThis.document = original;
    }
  });

  it('emits a single metadata comment for a multi-mode set', () => {
    const compiled = compileThemeSet([resolveCelestialLight(), resolveCelestialDark()], {
      ...defaultOptions,
      includeMetadataComment: true,
    });
    const headers = compiled.cssText.match(/\/\* Celestial Styles /g) ?? [];
    expect(headers).toHaveLength(1);
    expect(compiled.cssText).toContain('modes=dark,light');
  });

  it('treats compileThemeSet.variables as last-mode-wins convenience', () => {
    const light = compileResolvedTheme(resolveCelestialLight(), defaultOptions);
    const dark = compileResolvedTheme(resolveCelestialDark(), defaultOptions);
    const set = compileThemeSet([resolveCelestialLight(), resolveCelestialDark()], defaultOptions);
    expect(set.cssText).toContain('data-cui-mode="light"');
    expect(set.cssText).toContain('data-cui-mode="dark"');
    expect(set.variables['--cui-surface-canvas']).toBe(dark.variables['--cui-surface-canvas']);
    expect(set.variables['--cui-surface-canvas']).not.toBe(light.variables['--cui-surface-canvas']);
  });
});
