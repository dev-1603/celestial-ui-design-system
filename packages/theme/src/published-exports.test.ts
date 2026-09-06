import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

function resolveExportTarget(pkgRoot: string, exportValue: unknown): string | null {
  if (typeof exportValue === 'string') {
    return path.join(pkgRoot, exportValue);
  }
  if (exportValue && typeof exportValue === 'object' && 'default' in exportValue) {
    const def = (exportValue as { default: string }).default;
    return path.join(pkgRoot, def);
  }
  return null;
}

describe('published export map', () => {
  const pkgRoot = path.join(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')) as {
    exports: Record<string, string | { default: string; types?: string }>;
    files?: string[];
  };

  it('declares root export', () => {
    expect(pkg.exports['.']).toBeDefined();
  });

  it('limits published files to dist', () => {
    expect(pkg.files).toEqual(['dist']);
  });

  it('resolves every export target on disk after build', () => {
    for (const [subpath, value] of Object.entries(pkg.exports)) {
      const target = resolveExportTarget(pkgRoot, value);
      expect(target, `missing target for ${subpath}`).not.toBeNull();
      expect(fs.existsSync(target!), `${subpath} -> ${target}`).toBe(true);
    }
  });
});
