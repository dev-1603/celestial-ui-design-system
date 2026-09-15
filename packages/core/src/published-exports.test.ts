import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const IMPORT_FROM = /(?:^|\n)(?:export|import)(\s+type)?\s+[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g;
const SIDE_EFFECT_IMPORT = /(?:^|\n)import\s+['"]([^'"]+)['"]/g;

function collectRelativeSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  IMPORT_FROM.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = IMPORT_FROM.exec(source))) {
    if (match[1]) continue;
    const specifier = match[2];
    if (specifier?.startsWith('.')) specifiers.push(specifier);
  }
  SIDE_EFFECT_IMPORT.lastIndex = 0;
  while ((match = SIDE_EFFECT_IMPORT.exec(source))) {
    const specifier = match[1];
    if (specifier?.startsWith('.')) specifiers.push(specifier);
  }
  return specifiers;
}

function resolveImport(fromFile: string, specifier: string): string {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.json`,
    path.join(base, 'index.ts'),
  ];
  const resolved = candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
  if (!resolved) {
    throw new Error(`Unable to resolve "${specifier}" from ${fromFile}`);
  }
  return resolved;
}

function collectModuleGraph(entryFile: string): string[] {
  const visited = new Set<string>();
  const queue = [path.resolve(entryFile)];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    if (!current.endsWith('.ts') && !current.endsWith('.js')) continue;

    const source = fs.readFileSync(current, 'utf8');
    for (const specifier of collectRelativeSpecifiers(source)) {
      queue.push(resolveImport(current, specifier));
    }
  }

  return [...visited];
}

describe('published export map', () => {
  const pkgRoot = path.join(__dirname, '..');

  it('does not export testing, catalog, or specs from root barrel source', () => {
    const rootSource = fs.readFileSync(path.join(pkgRoot, 'src/index.ts'), 'utf8');
    expect(rootSource).not.toContain('./testing');
    expect(rootSource).not.toContain('./catalog');
    expect(rootSource).not.toContain('./specs/');
  });

  it("accordion's module graph does not include dialog.js or the spec hub", () => {
    const accordionSource = path.join(pkgRoot, 'src/catalog/specs/accordion.ts');
    const graph = collectModuleGraph(accordionSource);
    const rel = graph
      .map((file) => path.relative(path.join(pkgRoot, 'src'), file).replaceAll('\\', '/'))
      .sort();

    expect(rel).toContain('catalog/specs/accordion.ts');
    expect(rel).toContain('catalog/specs/spec-lookup.ts');
    expect(rel).not.toContain('catalog/specs/registry.ts');
    expect(rel).not.toContain('catalog/specs/dialog.ts');
    expect(rel).not.toContain('catalog/specs/button.ts');
    expect(rel).not.toContain('catalog/specs/input.ts');
    expect(rel).not.toContain('catalog/specs/checkbox.ts');
    expect(rel).not.toContain('catalog/specs/select.ts');
    expect(rel).not.toContain('catalog/specs/table.ts');
    expect(rel).not.toContain('catalog/spec-factory.ts');
    expect(rel).not.toContain('catalog/data/generic-component-inventory.json');

    const compiledNames = rel.map((file) => file.replace(/\.ts$/, '.js'));
    expect(compiledNames).not.toContain('catalog/specs/dialog.js');
    expect(compiledNames).not.toContain('catalog/specs/registry.js');
  });

  it('emitted ESM relative specifiers include .js extensions', () => {
    const esmIndex = fs.readFileSync(path.join(pkgRoot, 'dist/esm/index.js'), 'utf8');
    expect(esmIndex).toMatch(/from ['"]\.\/version\.js['"]/);
    expect(esmIndex).not.toMatch(/from ['"]\.\/version['"]/);
    const esmDts = fs.readFileSync(path.join(pkgRoot, 'dist/esm/index.d.ts'), 'utf8');
    expect(esmDts).toMatch(/from ['"]\.\/version\.js['"]/);
  });
});
