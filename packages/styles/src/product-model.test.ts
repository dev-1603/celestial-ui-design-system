import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { compileResolvedTheme, compileThemeSet } from './compiler';
import { createThemeStyleManager } from './runtime';
import { applyThemeAttributes, clearScopeRegistry } from './scope';
import {
  resolveCelestialLight,
  resolveCelestialDark,
  resolveAcmeDark,
} from './test/fixtures';

describe('product model — one visual language', () => {
  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('product');
    clearScopeRegistry();
  });

  afterEach(() => {
    clearScopeRegistry();
  });

  it('normal MFEs inherit host theme/mode without their own scope attributes', () => {
    const compiled = compileThemeSet(
      [resolveCelestialLight(), resolveCelestialDark()],
      { scope: { kind: 'document' } },
    );
    const manager = createThemeStyleManager({ document: doc });
    manager.attach({ kind: 'document' }, compiled);
    applyThemeAttributes(doc.documentElement, {
      themeId: 'celestial',
      mode: 'light',
    });

    const mfeA = doc.createElement('div');
    mfeA.setAttribute('data-mfe', 'a');
    const mfeB = doc.createElement('div');
    mfeB.setAttribute('data-mfe', 'b');
    doc.body.append(mfeA, mfeB);

    expect(mfeA.getAttribute('data-cui-theme')).toBeNull();
    expect(mfeB.getAttribute('data-cui-theme')).toBeNull();
    expect(mfeA.getAttribute('data-cui-mode')).toBeNull();
    expect(mfeB.getAttribute('data-cui-sandbox')).toBeNull();
    expect(doc.documentElement.getAttribute('data-cui-theme')).toBe('celestial');
    expect(doc.documentElement.getAttribute('data-cui-mode')).toBe('light');
    expect(compiled.cssText).toContain(':root[data-cui-theme="celestial"]');
    expect(compiled.cssText).not.toContain('data-cui-sandbox');
    manager.destroy();
  });

  it('host mode change updates document state without a new stylesheet or MFE updates', () => {
    const compiled = compileThemeSet(
      [resolveCelestialLight(), resolveCelestialDark()],
      { scope: { kind: 'document' } },
    );
    const manager = createThemeStyleManager({ document: doc });
    const attachment = manager.attach({ kind: 'document' }, compiled);
    const cssBefore = attachment.styleElement.textContent;
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'light' });

    const mfe = doc.createElement('section');
    doc.body.appendChild(mfe);

    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'dark' });

    expect(attachment.styleElement.textContent).toBe(cssBefore);
    expect(doc.head.querySelectorAll('style').length).toBe(1);
    expect(doc.documentElement.getAttribute('data-cui-mode')).toBe('dark');
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    expect(doc.documentElement.classList.contains('light')).toBe(false);
    expect(mfe.getAttribute('data-cui-mode')).toBeNull();
    manager.destroy();
  });

  it('explicit sandbox isolates theme/mode from host and inheriting MFEs', () => {
    const hostCss = compileThemeSet(
      [resolveCelestialLight(), resolveCelestialDark()],
      { scope: { kind: 'document' } },
    );
    const sandboxCss = compileResolvedTheme(resolveAcmeDark(), {
      scope: { kind: 'sandbox', id: 'preview' },
    });
    const manager = createThemeStyleManager({ document: doc });
    manager.attach({ kind: 'document' }, hostCss);
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'light' });

    const mfe = doc.createElement('div');
    doc.body.appendChild(mfe);

    const sandbox = doc.createElement('div');
    sandbox.setAttribute('data-cui-sandbox', 'preview');
    doc.body.appendChild(sandbox);

    manager.attach({ kind: 'sandbox', id: 'preview' }, sandboxCss);
    manager.setState(sandbox, {
      themeId: 'acme',
      mode: 'dark',
      scope: { kind: 'sandbox', id: 'preview' },
    });

    expect(doc.documentElement.getAttribute('data-cui-theme')).toBe('celestial');
    expect(doc.documentElement.getAttribute('data-cui-mode')).toBe('light');
    expect(mfe.getAttribute('data-cui-theme')).toBeNull();
    expect(sandbox.getAttribute('data-cui-theme')).toBe('acme');
    expect(sandbox.getAttribute('data-cui-mode')).toBe('dark');
    expect(sandboxCss.selector).toContain('data-cui-sandbox="preview"');
    expect(sandboxCss.selector).not.toContain(':root');
    expect(doc.head.querySelectorAll('style').length).toBe(2);
    manager.destroy();
  });

  it('sandbox theme change does not leak into host or normal MFE nodes', () => {
    const hostCss = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const sandboxLight = compileResolvedTheme(resolveCelestialLight(), {
      scope: { kind: 'sandbox', id: 'preview' },
    });
    const sandboxAcme = compileResolvedTheme(resolveAcmeDark(), {
      scope: { kind: 'sandbox', id: 'preview' },
    });
    const manager = createThemeStyleManager({ document: doc, schedule: 'sync' });
    const hostAttach = manager.attach({ kind: 'document' }, hostCss);
    manager.setState(doc.documentElement, { themeId: 'celestial', mode: 'light' });

    const sandbox = doc.createElement('div');
    doc.body.appendChild(sandbox);
    const sandboxAttach = manager.attach({ kind: 'sandbox', id: 'preview' }, sandboxLight);
    manager.setState(sandbox, {
      themeId: 'celestial',
      mode: 'light',
      scope: { kind: 'sandbox', id: 'preview' },
    });

    const hostCssText = hostAttach.styleElement.textContent;
    manager.attach({ kind: 'sandbox', id: 'preview' }, sandboxAcme);
    manager.setState(sandbox, {
      themeId: 'acme',
      mode: 'dark',
      scope: { kind: 'sandbox', id: 'preview' },
    });

    expect(doc.documentElement.getAttribute('data-cui-theme')).toBe('celestial');
    expect(doc.documentElement.getAttribute('data-cui-mode')).toBe('light');
    expect(hostAttach.styleElement.textContent).toBe(hostCssText);
    expect(sandboxAttach.styleElement.textContent).toBe(sandboxAcme.cssText);
    expect(doc.head.querySelectorAll('style').length).toBe(2);
    manager.destroy();
  });
});
