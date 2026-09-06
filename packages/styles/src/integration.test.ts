import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  createThemeRegistry,
  resolveTheme,
  CELESTIAL_THEME,
} from '@celestial-ui/theme';
import { compileResolvedTheme, compileThemeSet } from './compiler';
import { generateShadcnAdapter } from './shadcn';
import { generateBaseCss } from './base';
import { resolveCelestialLight } from './test/fixtures';

describe('integration', () => {
  it('resolves real theme and compiles without mocks', () => {
    const registry = createThemeRegistry([CELESTIAL_THEME]);
    const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
    const dark = resolveTheme(registry, { themeId: 'celestial', mode: 'dark' });

    expect(light.validation.isValid).toBe(true);
    expect(dark.validation.isValid).toBe(true);

    const compiled = compileThemeSet([light, dark], { scope: { kind: 'document' } });
    expect(compiled.cssText.length).toBeGreaterThan(1000);
    expect(compiled.cssText).toContain('--cui-primary');
    expect(compiled.contentHash).toMatch(/^cui-[a-f0-9]{8}$/);
  });

  it('static build output matches compiler when dist exists', () => {
    const registry = createThemeRegistry([CELESTIAL_THEME]);
    const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
    const dark = resolveTheme(registry, { themeId: 'celestial', mode: 'dark' });
    const compiled = compileThemeSet([light, dark], {
      scope: { kind: 'document' },
      includeMetadataComment: true,
    });

    const distPath = path.join(__dirname, '..', 'dist', 'css', 'index.css');
    if (fs.existsSync(distPath)) {
      const built = fs.readFileSync(distPath, 'utf8');
      expect(built).toBe(compiled.cssText);
    }
  });

  it('sandbox selectors isolate from the document root used by normal MFEs', () => {
    const host = compileResolvedTheme(resolveCelestialLight(), { scope: { kind: 'document' } });
    const sandbox = compileResolvedTheme(resolveCelestialLight(), {
      scope: { kind: 'sandbox', id: 'preview' },
    });
    expect(host.selector).toContain(':root[data-cui-theme="celestial"]');
    expect(host.selector).not.toContain('data-cui-sandbox');
    expect(sandbox.selector).toContain('data-cui-sandbox="preview"');
    expect(sandbox.selector).not.toContain(':root');
  });

  it('static base and shadcn adapters cover both appearance modes', () => {
    const base = [generateBaseCss({ mode: 'light' }), generateBaseCss({ mode: 'dark' })].join('\n');
    const shadcn = [
      generateShadcnAdapter(undefined, { mode: 'light' }),
      generateShadcnAdapter(undefined, { mode: 'dark' }),
    ].join('\n');
    expect(base).toContain('data-cui-mode="light"');
    expect(base).toContain('data-cui-mode="dark"');
    expect(shadcn).toContain('data-cui-mode="light"');
    expect(shadcn).toContain('data-cui-mode="dark"');
  });
});
