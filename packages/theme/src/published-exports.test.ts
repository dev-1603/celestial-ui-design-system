import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('published export map', () => {
  const pkgRoot = path.join(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')) as {
    files?: string[];
  };

  it('limits published files to dist', () => {
    expect(pkg.files).toEqual(['dist']);
  });

  it('declares sideEffects false for tree-shaking', () => {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')) as {
      sideEffects?: unknown;
    };
    expect(pkgJson.sideEffects).toBe(false);
  });
});
