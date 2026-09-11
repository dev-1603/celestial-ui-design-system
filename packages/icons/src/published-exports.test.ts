import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('published export map', () => {
  const pkgRoot = path.join(__dirname, '..');

  it('does not export providers from root barrel source', () => {
    const rootSource = fs.readFileSync(path.join(pkgRoot, 'src/index.ts'), 'utf8');
    expect(rootSource).not.toContain('./providers/');
  });
});
