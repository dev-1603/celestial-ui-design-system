import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FRAMEWORK_NAME = /\b(react|vue|svelte|angular|next|nuxt|sveltekit)\b/i;
const FRAMEWORK_IMPORT =
  /from\s+['"](?:react|react-dom|vue|svelte|@angular\/|next(?:\/|$)|nuxt|@sveltejs\/)/;

describe('framework-agnostic release gate', () => {
  const pkgRoot = path.join(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };

  it('has no UI framework runtime, peer, or production dependencies', () => {
    const names = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
    ];
    expect(names).toEqual(['@celestial-ui/theme', '@celestial-ui/tokens']);
    for (const name of names) {
      expect(name).not.toMatch(FRAMEWORK_NAME);
    }
  });

  it('devDependencies do not pull UI frameworks into the package', () => {
    for (const name of Object.keys(pkg.devDependencies ?? {})) {
      expect(name).not.toMatch(FRAMEWORK_NAME);
    }
  });

  it('source has no framework imports or JSX/TSX modules', () => {
    const srcRoot = path.join(pkgRoot, 'src');
    const files: string[] = [];
    function walk(dir: string): void {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        files.push(full);
      }
    }
    walk(srcRoot);

    expect(files.some((f) => f.endsWith('.tsx') || f.endsWith('.jsx'))).toBe(false);

    for (const file of files) {
      if (!file.endsWith('.ts')) continue;
      const source = fs.readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(FRAMEWORK_IMPORT);
    }
  });
});
