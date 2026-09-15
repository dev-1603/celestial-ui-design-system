import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { compileResolvedTheme } from './compiler';
import { createThemeStyleManager, adoptHydratedStyle } from './runtime';
import { clearScopeRegistry } from './scope';
import { StyleRuntimeError } from './errors';
import { resolveCelestialLight, resolveAcmeLight } from './test/fixtures';

describe('runtime', () => {
  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
    clearScopeRegistry();
  });

  afterEach(() => {
    clearScopeRegistry();
  });

  it('attaches a style element to document head', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const manager = createThemeStyleManager({ document: doc });
    const attachment = manager.attach({ kind: 'document' }, compiled);
    expect(doc.head.querySelector('style')).toBe(attachment.styleElement);
    expect(attachment.styleElement.textContent).toBe(compiled.cssText);
    manager.destroy();
  });

  it('is a no-op when attaching identical content', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const manager = createThemeStyleManager({ document: doc });
    const a = manager.attach({ kind: 'document' }, compiled);
    const b = manager.attach({ kind: 'document' }, compiled);
    expect(a.styleElement).toBe(b.styleElement);
    expect(doc.head.querySelectorAll('style').length).toBe(1);
    manager.destroy();
  });

  it('updates style element textContent in place', () => {
    const light = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const manager = createThemeStyleManager({ document: doc, schedule: 'sync' });
    const attachment = manager.attach({ kind: 'document' }, light);

    const modified = {
      ...light,
      cssText: light.cssText + '\n/* updated */',
      contentHash: 'different-hash',
    };
    manager.update(attachment, modified);
    expect(attachment.styleElement.textContent).toContain('/* updated */');
    manager.destroy();
  });

  it('detaches and removes style element', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const manager = createThemeStyleManager({ document: doc });
    const attachment = manager.attach({ kind: 'document' }, compiled);
    manager.detach(attachment);
    expect(doc.head.querySelector('style')).toBeNull();
  });

  it('propagates CSP nonce to style element', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const manager = createThemeStyleManager({ document: doc, nonce: 'abc123' });
    const attachment = manager.attach({ kind: 'document' }, compiled);
    expect(attachment.styleElement.getAttribute('nonce')).toBe('abc123');
    manager.destroy();
  });

  it('rejects invalid nonce', () => {
    expect(() => createThemeStyleManager({ document: doc, nonce: 'bad nonce!' })).toThrow(
      StyleRuntimeError,
    );
  });

  it('updates an existing application attachment in place instead of duplicating', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), {
      scope: { kind: 'application', id: 'app' },
    });
    const manager = createThemeStyleManager({ document: doc });
    const first = manager.attach({ kind: 'application', id: 'app' }, compiled);
    const different = { ...compiled, contentHash: 'other-hash', cssText: compiled.cssText + '\n' };
    const second = manager.attach({ kind: 'application', id: 'app' }, different);
    expect(second.styleElement).toBe(first.styleElement);
    expect(doc.head.querySelectorAll('style').length).toBe(1);
    expect(second.styleElement.textContent).toBe(different.cssText);
    manager.destroy();
  });

  it('adopts hydrated style when hash matches', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const style = doc.createElement('style');
    style.id = compiled.styleId;
    style.setAttribute('data-cui-hash', compiled.contentHash);
    doc.head.appendChild(style);

    const adopted = adoptHydratedStyle(doc, {
      styleId: compiled.styleId,
      contentHash: compiled.contentHash,
    });
    expect(adopted).toBe(style);
  });

  it('throws on hydration hash mismatch', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const style = doc.createElement('style');
    style.id = compiled.styleId;
    style.setAttribute('data-cui-hash', 'wrong');
    doc.head.appendChild(style);

    expect(() =>
      adoptHydratedStyle(doc, {
        styleId: compiled.styleId,
        contentHash: 'expected',
      }),
    ).toThrow(StyleRuntimeError);
  });

  it('reuses an SSR style element instead of duplicating it', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const style = doc.createElement('style');
    style.id = compiled.styleId;
    style.setAttribute('data-cui-hash', compiled.contentHash);
    style.textContent = compiled.cssText;
    doc.head.appendChild(style);

    const manager = createThemeStyleManager({ document: doc });
    const attachment = manager.attach({ kind: 'document' }, compiled);
    expect(attachment.styleElement).toBe(style);
    expect(doc.head.querySelectorAll('style').length).toBe(1);
    manager.destroy();
  });

  it('switches mode via attributes without creating another style element', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const manager = createThemeStyleManager({ document: doc });
    const attachment = manager.attach({ kind: 'document' }, compiled);
    const cssBefore = attachment.styleElement.textContent;
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'dark' });
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'light' });
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'dark' });
    expect(attachment.styleElement).toBe(doc.head.querySelector('style'));
    expect(attachment.styleElement.textContent).toBe(cssBefore);
    expect(doc.head.querySelectorAll('style').length).toBe(1);
    expect(doc.documentElement.getAttribute('data-cui-mode')).toBe('dark');
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    manager.destroy();
  });

  it('repeated identical setState does not accumulate style nodes', () => {
    const compiled = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const manager = createThemeStyleManager({ document: doc });
    const attachment = manager.attach({ kind: 'document' }, compiled);
    const cssBefore = attachment.styleElement.textContent;
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'dark' });
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'dark' });
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'dark' });
    expect(doc.head.querySelectorAll('style').length).toBe(1);
    expect(attachment.styleElement.textContent).toBe(cssBefore);
    manager.destroy();
  });

  it('theme/value change reuses the style node and replaces CSS text', () => {
    const celestial = compileResolvedTheme(resolveCelestialLight(), {
      scope: { kind: 'document' },
    });
    const acme = compileResolvedTheme(resolveAcmeLight(), { scope: { kind: 'document' } });
    const manager = createThemeStyleManager({ document: doc });
    const first = manager.attach({ kind: 'document' }, celestial);
    const second = manager.attach({ kind: 'document' }, acme);
    expect(second.styleElement).toBe(first.styleElement);
    expect(second.styleElement.textContent).toBe(acme.cssText);
    expect(second.styleElement.textContent).not.toBe(celestial.cssText);
    expect(doc.head.querySelectorAll('style').length).toBe(1);
    manager.destroy();
  });
});

describe('DOM_UNAVAILABLE', () => {
  it('throws when document is not available', () => {
    const original = globalThis.document;
    // @ts-expect-error test override
    delete globalThis.document;
    try {
      expect(() => createThemeStyleManager()).toThrow(StyleRuntimeError);
    } finally {
      globalThis.document = original;
    }
  });
});
