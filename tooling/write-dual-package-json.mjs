#!/usr/bin/env node
/**
 * Writes module-type markers so Node treats each emit tree correctly.
 * `"type": "module"` lives only in dist/esm; CJS stays commonjs.
 *
 * tsc does not rewrite `__dirname` / `__filename` for the ESM emit. Patch
 * those identifiers in `dist/esm` so Node `import` (not just bundlers) works.
 *
 * tsc `moduleResolution: bundler` also emits extensionless relative specifiers.
 * Node ESM requires explicit `.js` (or `/index.js`) extensions — rewrite those
 * in `dist/esm` JS and declarations. CJS is left extensionless on purpose.
 */
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const cjsDir = path.join(cwd, 'dist/cjs');
const esmDir = path.join(cwd, 'dist/esm');

fs.mkdirSync(cjsDir, { recursive: true });
fs.mkdirSync(esmDir, { recursive: true });
fs.writeFileSync(path.join(cjsDir, 'package.json'), `${JSON.stringify({ type: 'commonjs' })}\n`);
// Nested ESM marker must also be side-effect-free so bundlers can DCE unused
// re-exports (e.g. tokens catalog) before they touch Node built-ins.
// CSS side-effects stay on each package's root `sideEffects` globs.
fs.writeFileSync(
  path.join(esmDir, 'package.json'),
  `${JSON.stringify({ type: 'module', sideEffects: false })}\n`,
);

const RELATIVE_SPECIFIER_RE = /(?:from\s+|import\s*\(\s*|import\s+)(['"])(\.\.?\/[^'"]+)\1/g;
const HAS_FILE_EXT = /\.(?:js|mjs|cjs|json|css|node|svg)$/;

patchEsmNodeGlobals(esmDir);
rewriteEsmRelativeSpecifiers(esmDir);

function walkFiles(dir, predicate, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, predicate, files);
    } else if (predicate(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function hasImport(source, names, specPattern) {
  return names.every((name) =>
    new RegExp(
      String.raw`import\s*\{[^}]*\b${name}\b[^}]*\}\s*from\s*['"]${specPattern}['"]`,
    ).test(source),
  );
}

function patchEsmNodeGlobals(dir) {
  for (const file of walkFiles(dir, (name) => name.endsWith('.js'))) {
    let source = fs.readFileSync(file, 'utf8');
    const needsDirname = source.includes('__dirname');
    const needsFilename = source.includes('__filename');
    if (!needsDirname && !needsFilename) continue;

    if (!hasImport(source, ['fileURLToPath'], '(?:node:)?url')) {
      source = `import { fileURLToPath } from 'node:url';\n${source}`;
    }
    if (needsDirname && !/from\s*['"](?:node:)?path['"]/.test(source)) {
      source = `import * as path from 'node:path';\n${source}`;
    }
    if (needsFilename) {
      source = source.replaceAll('__filename', 'fileURLToPath(import.meta.url)');
    }
    if (needsDirname) {
      source = source.replaceAll('__dirname', 'path.dirname(fileURLToPath(import.meta.url))');
    }
    fs.writeFileSync(file, source);
  }
}

function resolveRelativeSpecifier(fromFile, spec) {
  if (HAS_FILE_EXT.test(spec)) return spec;

  const abs = path.resolve(path.dirname(fromFile), spec);
  if (fs.existsSync(`${abs}.js`) || fs.existsSync(`${abs}.d.ts`)) {
    return `${spec}.js`;
  }
  if (fs.existsSync(path.join(abs, 'index.js')) || fs.existsSync(path.join(abs, 'index.d.ts'))) {
    return `${spec.replace(/\/$/, '')}/index.js`;
  }
  return `${spec}.js`;
}

function rewriteJsonImportAttributes(source) {
  return source.replace(
    /from\s+(['"])(\.\.?\/[^'"]+\.json)\1(?!\s+with\b)/g,
    "from $1$2$1 with { type: 'json' }",
  );
}

function rewriteEsmRelativeSpecifiers(dir) {
  const files = walkFiles(
    dir,
    (name) =>
      (name.endsWith('.js') || name.endsWith('.d.ts')) &&
      !name.endsWith('.d.ts.map') &&
      !name.endsWith('.js.map'),
  );
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const next = rewriteJsonImportAttributes(
      source.replace(RELATIVE_SPECIFIER_RE, (full, quote, spec) =>
        full.replace(
          `${quote}${spec}${quote}`,
          `${quote}${resolveRelativeSpecifier(file, spec)}${quote}`,
        ),
      ),
    );
    if (next !== source) {
      fs.writeFileSync(file, next);
    }
  }
}
