import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { compileThemeSet } from './compiler';
import { generateTailwindBridge, DEFAULT_TAILWIND_BRIDGE } from './tailwind';
import { createThemeRegistry, resolveTheme, CELESTIAL_THEME } from '@celestial-ui/theme';

const cssDir = path.join(__dirname, '..', 'dist', 'css');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')) as {
  exports: Record<string, unknown>;
  sideEffects?: false | string[];
};

describe('published artifacts', () => {
  it('exposes the V1 CSS entry points', () => {
    expect(pkg.exports['./css']).toBe('./dist/css/index.css');
    expect(pkg.exports['./base']).toBe('./dist/css/base.css');
    expect(pkg.exports['./tailwind']).toBe('./dist/css/tailwind.css');
    expect(pkg.exports['./shadcn']).toBe('./dist/css/shadcn.css');
  });

  it('exposes additive JS subpaths for runtime, ssr, and compiler', () => {
    expect(pkg.exports['./runtime']).toEqual({
      import: {
        types: './dist/esm/runtime.d.ts',
        default: './dist/esm/runtime.js',
      },
      require: {
        types: './dist/cjs/runtime.d.ts',
        default: './dist/cjs/runtime.js',
      },
      default: './dist/cjs/runtime.js',
    });
    expect(pkg.exports['./ssr']).toEqual({
      import: {
        types: './dist/esm/ssr.d.ts',
        default: './dist/esm/ssr.js',
      },
      require: {
        types: './dist/cjs/ssr.d.ts',
        default: './dist/cjs/ssr.js',
      },
      default: './dist/cjs/ssr.js',
    });
    expect(pkg.exports['./compiler']).toEqual({
      import: {
        types: './dist/esm/compiler.d.ts',
        default: './dist/esm/compiler.js',
      },
      require: {
        types: './dist/cjs/compiler.d.ts',
        default: './dist/cjs/compiler.js',
      },
      default: './dist/cjs/compiler.js',
    });
  });

  it('exposes JS bridge subpaths that do not collide with CSS assets', () => {
    expect(pkg.exports['./bridges/tailwind']).toEqual({
      import: {
        types: './dist/esm/tailwind.d.ts',
        default: './dist/esm/tailwind.js',
      },
      require: {
        types: './dist/cjs/tailwind.d.ts',
        default: './dist/cjs/tailwind.js',
      },
      default: './dist/cjs/tailwind.js',
    });
    expect(pkg.exports['./bridges/shadcn']).toEqual({
      import: {
        types: './dist/esm/shadcn.d.ts',
        default: './dist/esm/shadcn.js',
      },
      require: {
        types: './dist/cjs/shadcn.d.ts',
        default: './dist/cjs/shadcn.js',
      },
      default: './dist/cjs/shadcn.js',
    });
    expect(pkg.exports['./bridges/base']).toEqual({
      import: {
        types: './dist/esm/base.d.ts',
        default: './dist/esm/base.js',
      },
      require: {
        types: './dist/cjs/base.d.ts',
        default: './dist/cjs/base.js',
      },
      default: './dist/cjs/base.js',
    });
    expect(pkg.exports['./css']).toBe('./dist/css/index.css');
    expect(pkg.exports['./base']).toBe('./dist/css/base.css');
    expect(pkg.exports['./tailwind']).toBe('./dist/css/tailwind.css');
    expect(pkg.exports['./shadcn']).toBe('./dist/css/shadcn.css');
  });

  it('lists CSS globs in sideEffects (never false)', () => {
    expect(pkg.sideEffects).not.toBe(false);
    expect(Array.isArray(pkg.sideEffects)).toBe(true);
    expect(pkg.sideEffects?.every((glob) => glob.includes('.css') || glob.includes('/css'))).toBe(
      true,
    );
  });

  it('runtime JS does not import CSS files', () => {
    const files = ['runtime.js', 'ssr.js', 'compiler.js', 'index.js'];
    for (const file of files) {
      for (const tree of ['cjs', 'esm']) {
        const source = fs.readFileSync(path.join(__dirname, '..', 'dist', tree, file), 'utf8');
        expect(source, `${tree}/${file}`).not.toMatch(/\.css['"]/);
      }
    }
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

  it('does not re-export @internal helpers from the root barrel', () => {
    const indexSource = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');
    expect(indexSource).not.toContain('getSemanticRegistryEntries');
    expect(indexSource).not.toContain('validateSemanticRegistry');
    expect(indexSource).not.toContain('tokenSubPathToVariableName');
    expect(indexSource).not.toContain('isValidTokenPath');
    expect(indexSource).not.toContain('COMPOSITE_TOKEN_TYPES');
    expect(indexSource).not.toContain('SCALAR_TOKEN_TYPES');
    expect(indexSource).not.toContain('generateSemanticVariables');
    expect(indexSource).toContain('tokenPathToVariableName');
    expect(indexSource).toContain('compileResolvedTheme');
  });
});
