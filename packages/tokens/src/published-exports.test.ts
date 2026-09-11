import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('published export map', () => {
  const pkgRoot = path.join(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')) as {
    files?: string[];
  };

  it('includes dist and data in files for published catalog access', () => {
    expect(pkg.files).toContain('dist');
    expect(pkg.files).toContain('data');
  });
});
