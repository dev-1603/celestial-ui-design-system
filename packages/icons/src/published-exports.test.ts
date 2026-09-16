import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('published export map', () => {
  const pkgRoot = path.join(__dirname, '..');

  it('does not export providers from root barrel source', () => {
    const rootSource = fs.readFileSync(path.join(pkgRoot, 'src/index.ts'), 'utf8');
    expect(rootSource).not.toContain('./providers/');
  });

  it('loads lucide catalogue SVGs without the Node peers helper or a full-pack require', () => {
    const lucideSource = fs.readFileSync(path.join(pkgRoot, 'src/providers/lucide.ts'), 'utf8');
    expect(lucideSource).not.toContain("from '../peers'");
    expect(lucideSource).not.toMatch(/from ['"]module['"]/);
    expect(lucideSource).not.toContain("require('lucide-static')");
    expect(lucideSource).toContain("from './generated/lucide-catalogue-svgs'");
    expect(lucideSource).toContain('export const lucide = LucideAdapter');
  });

  it('loads heroicons catalogue SVGs without the Node peers helper', () => {
    const heroSource = fs.readFileSync(path.join(pkgRoot, 'src/providers/heroicons.ts'), 'utf8');
    expect(heroSource).not.toContain("from '../peers'");
    expect(heroSource).not.toMatch(/from ['"](?:node:)?(?:fs|module|url)['"]/);
    expect(heroSource).toContain("from './generated/heroicons-catalogue-svgs'");
  });
});
