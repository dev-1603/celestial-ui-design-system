import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('published export map', () => {
  const pkgRoot = path.join(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')) as {
    files?: string[];
    sideEffects?: false | string[];
  };

  it('includes dist and data in files for published catalog access', () => {
    expect(pkg.files).toContain('dist');
    expect(pkg.files).toContain('data');
  });

  it('lists CSS globs in sideEffects (never false)', () => {
    expect(pkg.sideEffects).not.toBe(false);
    expect(Array.isArray(pkg.sideEffects)).toBe(true);
    expect(pkg.sideEffects?.every((glob) => glob.includes('.css') || glob.includes('/css'))).toBe(
      true,
    );
  });

  it('re-exports the public API by name (no export *)', () => {
    const indexSource = fs.readFileSync(path.join(pkgRoot, 'src/index.ts'), 'utf8');
    expect(indexSource).not.toMatch(/^export \*/m);
    expect(indexSource).toContain('getCanonicalTokenSources');
    expect(indexSource).toContain('buildTokenConfigForMode');
    expect(indexSource).toContain("from './catalog'");
  });

  it('does not import Node fs/path/url in catalog source', () => {
    const catalogSource = fs.readFileSync(path.join(pkgRoot, 'src/catalog.ts'), 'utf8');
    expect(catalogSource).not.toMatch(/from ['"](?:node:)?(?:fs|path|url|module)['"]/);
    expect(catalogSource).not.toMatch(/\b__dirname\b/);
    expect(catalogSource).not.toMatch(/\b__filename\b/);
    expect(catalogSource).toContain('./generated/canonical-sources');
  });
});
