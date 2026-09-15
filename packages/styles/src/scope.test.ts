import { describe, it, expect } from 'vitest';
import { buildScopeSelector, getThemeAttributes, applyThemeAttributes, getScopeKey } from './scope';

describe('scope', () => {
  it('builds document selector with compatibility classes', () => {
    const selector = buildScopeSelector({ kind: 'document' }, 'celestial', 'light');
    expect(selector).toContain(':root[data-cui-theme="celestial"]');
    expect(selector).toContain('[data-cui-mode="light"]');
    expect(selector).toContain(':root.light');
    expect(selector).toContain('.light');
  });

  it('builds application scope selector', () => {
    const selector = buildScopeSelector({ kind: 'application', id: 'app' }, 'celestial', 'dark');
    expect(selector).toContain('[data-cui-root="app"]');
    expect(selector).toContain('data-cui-mode="dark"');
  });

  it('builds sandbox scope selector', () => {
    const selector = buildScopeSelector({ kind: 'sandbox', id: 'preview' }, 'acme', 'light');
    expect(selector).toContain('[data-cui-sandbox="preview"]');
    expect(selector).toContain('data-cui-theme="acme"');
  });

  it('escapes special characters in scope ids', () => {
    const selector = buildScopeSelector({ kind: 'sandbox', id: 'test-id' }, 'celestial', 'light');
    expect(selector).toContain('data-cui-sandbox="test-id"');
  });

  it('returns theme attributes for document scope', () => {
    const attrs = getThemeAttributes({
      themeId: 'celestial',
      mode: 'light',
      modePreference: 'system',
    });
    expect(attrs).toEqual({
      'data-cui-theme': 'celestial',
      'data-cui-mode': 'light',
      'data-cui-mode-preference': 'system',
    });
  });

  it('includes scope attributes for application and sandbox', () => {
    expect(
      getThemeAttributes({
        themeId: 'celestial',
        mode: 'dark',
        scope: { kind: 'application', id: 'main' },
      })['data-cui-root'],
    ).toBe('main');

    expect(
      getThemeAttributes({
        themeId: 'acme',
        mode: 'light',
        scope: { kind: 'sandbox', id: 'preview' },
      })['data-cui-sandbox'],
    ).toBe('preview');
  });

  it('generates stable scope keys', () => {
    expect(getScopeKey({ kind: 'document' })).toBe('document');
    expect(getScopeKey({ kind: 'application', id: 'app' })).toBe('application:app');
    expect(getScopeKey({ kind: 'sandbox', id: 'x' })).toBe('sandbox:x');
  });
});

describe('applyThemeAttributes', () => {
  it('applies and cleans up attributes with compatibility class', () => {
    const el = document.createElement('div');
    const cleanup = applyThemeAttributes(el, { themeId: 'celestial', mode: 'dark' });
    expect(el.getAttribute('data-cui-theme')).toBe('celestial');
    expect(el.getAttribute('data-cui-mode')).toBe('dark');
    expect(el.classList.contains('dark')).toBe(true);
    cleanup.remove();
    expect(el.getAttribute('data-cui-theme')).toBeNull();
    expect(el.classList.contains('dark')).toBe(false);
  });
});
