import { describe, it, expect } from 'vitest';
import { compileResolvedTheme } from './compiler';
import {
  renderThemeStyleTag,
  createThemeHydrationState,
  createModeBootstrapScript,
  renderThemeRootAttributes,
} from './ssr';
import { resolveCelestialLight } from './test/fixtures';

describe('ssr', () => {
  const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });

  it('renders deterministic style tag', () => {
    const tag = renderThemeStyleTag(compiled, { id: 'test-style', nonce: 'abc123' });
    expect(tag).toContain('<style id="test-style"');
    expect(tag).toContain(`data-cui-hash="${compiled.contentHash}"`);
    expect(tag).toContain('nonce="abc123"');
    expect(tag).toContain(compiled.cssText.replace(/<\/style/gi, '<\\/style'));
  });

  it('escapes closing style tags in CSS', () => {
    const dangerous = {
      ...compiled,
      cssText: '/* test </style injection */',
    };
    const tag = renderThemeStyleTag(dangerous);
    expect(tag).not.toContain('</style injection');
    expect(tag).toContain('<\\/style');
  });

  it('creates hydration state', () => {
    const state = createThemeHydrationState(compiled, {
      themeId: 'celestial',
      mode: 'light',
      modePreference: 'system',
    });
    expect(state.contentHash).toBe(compiled.contentHash);
    expect(state.styleId).toBe(compiled.styleId);
    expect(state.themeId).toBe('celestial');
    expect(state.semanticCssApiVersion).toBe('1.0.0');
  });

  it('generates mode bootstrap script with validated identifiers', () => {
    const script = createModeBootstrapScript({
      themeId: 'celestial',
      defaultMode: 'light',
      storageKey: 'cui-mode',
    });
    expect(script).toContain('localStorage.getItem');
    expect(script).toContain('matchMedia');
    expect(script).toContain('data-cui-theme');
    expect(script).not.toContain('<');
  });

  it('sets mode-preference to stored explicit mode rather than always system', () => {
    const script = createModeBootstrapScript({
      themeId: 'celestial',
      defaultMode: 'light',
    });
    expect(script).toContain('var pref=explicit?stored:"system"');
    expect(script).not.toContain('data-cui-mode-preference","system"');
  });

  it('rejects invalid nonce on style tags', () => {
    expect(() => renderThemeStyleTag(compiled, { nonce: 'bad nonce!' })).toThrow();
  });

  it('rejects invalid themeId in bootstrap', () => {
    expect(() =>
      createModeBootstrapScript({ themeId: 'bad id!', defaultMode: 'light' }),
    ).toThrow();
  });

  it('renders root attributes string', () => {
    const attrs = renderThemeRootAttributes({
      themeId: 'celestial',
      mode: 'dark',
      modePreference: 'system',
    });
    expect(attrs).toContain('data-cui-theme="celestial"');
    expect(attrs).toContain('data-cui-mode="dark"');
  });
});
