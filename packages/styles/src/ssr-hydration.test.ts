import { describe, it, expect, afterEach } from 'vitest';
import { compileResolvedTheme, compileThemeSet } from './compiler';
import {
  renderThemeStyleTag,
  createThemeHydrationState,
  createModeBootstrapScript,
  renderThemeRootAttributes,
} from './ssr';
import { adoptHydratedStyle } from './runtime';
import { resolveCelestialLight, resolveCelestialDark } from './test/fixtures';

function stubMatchMedia(matchesDark: boolean): void {
  window.matchMedia = ((query: string) =>
    ({
      matches: query.includes('prefers-color-scheme: dark') ? matchesDark : false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    })) as typeof window.matchMedia;
}

describe('ssr hydration matrix', () => {
  const light = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
  const dark = compileResolvedTheme(resolveCelestialDark(), { scope: { kind: 'document' } });
  const both = compileThemeSet([resolveCelestialLight(), resolveCelestialDark()], {
    scope: { kind: 'document' },
  });

  it('SSR style id equals hydration/adoption id', () => {
    const tag = renderThemeStyleTag(both);
    const hydration = createThemeHydrationState(both, {
      themeId: 'celestial',
      mode: 'light',
      modePreference: 'system',
    });
    expect(tag).toContain(`id="${both.styleId}"`);
    expect(hydration.styleId).toBe(both.styleId);
  });

  it.each([
    { compiled: light, mode: 'light' as const, preference: undefined },
    { compiled: dark, mode: 'dark' as const, preference: undefined },
    { compiled: both, mode: 'light' as const, preference: 'system' as const },
    { compiled: both, mode: 'dark' as const, preference: 'system' as const },
  ])('matching server/client $mode / $preference hydrates', ({ compiled, mode, preference }) => {
    const doc = document.implementation.createHTMLDocument('ssr');
    const tag = renderThemeStyleTag(compiled);
    doc.head.innerHTML = tag;
    const hydration = createThemeHydrationState(compiled, {
      themeId: 'celestial',
      mode,
      modePreference: preference,
    });
    const adopted = adoptHydratedStyle(doc, hydration);
    expect(adopted).not.toBeNull();
    expect(adopted!.id).toBe(compiled.styleId);
  });
});

describe('no-flash bootstrap', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.removeItem('cui-mode');
    document.documentElement.removeAttribute('data-cui-theme');
    document.documentElement.removeAttribute('data-cui-mode');
    document.documentElement.removeAttribute('data-cui-mode-preference');
    document.documentElement.classList.remove('light', 'dark');
  });

  function runBootstrap(): void {
    const script = createModeBootstrapScript({ themeId: 'celestial', defaultMode: 'light' });
    (0, eval)(script);
  }

  it('system/light: no stored mode, prefers light', () => {
    stubMatchMedia(false);
    runBootstrap();
    expect(document.documentElement.getAttribute('data-cui-mode')).toBe('light');
    expect(document.documentElement.getAttribute('data-cui-mode-preference')).toBe('system');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('system/dark: no stored mode, prefers dark — attributes match before paint', () => {
    stubMatchMedia(true);
    runBootstrap();
    expect(document.documentElement.getAttribute('data-cui-theme')).toBe('celestial');
    expect(document.documentElement.getAttribute('data-cui-mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-cui-mode-preference')).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const attrs = renderThemeRootAttributes({
      themeId: 'celestial',
      mode: 'dark',
      modePreference: 'system',
    });
    expect(attrs).toContain('data-cui-mode="dark"');
    expect(attrs).toContain('data-cui-mode-preference="system"');
  });

  it('explicit light wins over system/dark', () => {
    localStorage.setItem('cui-mode', 'light');
    stubMatchMedia(true);
    runBootstrap();
    expect(document.documentElement.getAttribute('data-cui-mode')).toBe('light');
    expect(document.documentElement.getAttribute('data-cui-mode-preference')).toBe('light');
  });

  it('explicit dark wins over system/light', () => {
    localStorage.setItem('cui-mode', 'dark');
    stubMatchMedia(false);
    runBootstrap();
    expect(document.documentElement.getAttribute('data-cui-mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-cui-mode-preference')).toBe('dark');
  });

  it('bootstrap payload is not a nonce injection surface', () => {
    const script = createModeBootstrapScript({ themeId: 'celestial', defaultMode: 'light' });
    expect(script).not.toContain('nonce');
    expect(script).not.toContain('<script');
  });
});
