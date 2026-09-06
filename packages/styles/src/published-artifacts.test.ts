import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { compileThemeSet } from './compiler';
import { generateTailwindBridge, DEFAULT_TAILWIND_BRIDGE } from './tailwind';
import { createThemeRegistry, resolveTheme, CELESTIAL_THEME } from '@celestial-ui/theme';

const cssDir = path.join(__dirname, '..', 'dist', 'css');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')) as {
  exports: Record<string, unknown>;
};

describe('published artifacts', () => {
  it('exposes the V1 CSS entry points', () => {
    expect(pkg.exports['./css']).toBe('./dist/css/index.css');
    expect(pkg.exports['./base']).toBe('./dist/css/base.css');
    expect(pkg.exports['./tailwind']).toBe('./dist/css/tailwind.css');
    expect(pkg.exports['./shadcn']).toBe('./dist/css/shadcn.css');
  });

  it('built CSS contains celestial light, dark, semantic, and compatibility vars', () => {
    const indexPath = path.join(cssDir, 'index.css');
    expect(fs.existsSync(indexPath), 'dist/css/index.css must exist after build').toBe(true);

    const css = fs.readFileSync(indexPath, 'utf8');
    expect(css).toContain('data-cui-mode="light"');
    expect(css).toContain('data-cui-mode="dark"');
    expect(css).toContain('--cui-primary:');
    expect(css).toContain('--cui-background:');
    expect(css).toContain('--cui-foreground:');
    expect(css).toContain('--cui-radius-md:');
    expect(css).not.toContain('--cui-radius-md: var(--cui-radius-md)');
    expect(css).toContain('--cui-action-primary-background:');
    expect(css).toContain('--cui-surface-canvas:');
  });

  it('built base and shadcn cover light and dark', () => {
    const basePath = path.join(cssDir, 'base.css');
    const shadcnPath = path.join(cssDir, 'shadcn.css');
    expect(fs.existsSync(basePath), 'dist/css/base.css must exist after build').toBe(true);
    expect(fs.existsSync(shadcnPath), 'dist/css/shadcn.css must exist after build').toBe(true);

    const base = fs.readFileSync(basePath, 'utf8');
    const shadcn = fs.readFileSync(shadcnPath, 'utf8');
    expect(base).toContain('data-cui-mode="light"');
    expect(base).toContain('data-cui-mode="dark"');
    expect(base).toContain('prefers-reduced-motion: reduce');
    expect(shadcn).toContain('--primary: var(--cui-primary)');
    expect(shadcn).toContain('data-cui-mode="light"');
    expect(shadcn).toContain('data-cui-mode="dark"');
  });

  it('built Tailwind bridge maps to variables present in compiled celestial CSS', () => {
    const twPath = path.join(cssDir, 'tailwind.css');
    expect(fs.existsSync(twPath), 'dist/css/tailwind.css must exist after build').toBe(true);

    const tw = fs.readFileSync(twPath, 'utf8');
    expect(tw).toBe(generateTailwindBridge());

    const registry = createThemeRegistry([CELESTIAL_THEME]);
    const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
    const compiled = compileThemeSet([light], { scope: { kind: 'document' } });
    for (const cuiRef of Object.values(DEFAULT_TAILWIND_BRIDGE)) {
      const match = cuiRef.match(/^var\((--cui-[a-zA-Z0-9-]+)\)$/);
      expect(match).not.toBeNull();
      expect(compiled.variables[match![1]]).toBeDefined();
      expect(tw).toContain(cuiRef);
    }
  });
});
