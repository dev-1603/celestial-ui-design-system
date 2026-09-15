#!/usr/bin/env node
/**
 * Writes module-type markers so Node treats each emit tree correctly.
 * `"type": "module"` lives only in dist/esm; CJS stays commonjs.
 *
 * tsc does not rewrite `__dirname` / `__filename` for the ESM emit. Patch
 * those identifiers in `dist/esm` so Node `import` (not just bundlers) works.
 */
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const cjsDir = path.join(cwd, 'dist/cjs');
const esmDir = path.join(cwd, 'dist/esm');

fs.mkdirSync(cjsDir, { recursive: true });
fs.mkdirSync(esmDir, { recursive: true });
fs.writeFileSync(path.join(cjsDir, 'package.json'), `${JSON.stringify({ type: 'commonjs' })}\n`);
fs.writeFileSync(path.join(esmDir, 'package.json'), `${JSON.stringify({ type: 'module' })}\n`);

patchEsmNodeGlobals(esmDir);

function walkJs(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJs(full, files);
    } else if (entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

function hasImport(source, names, specPattern) {
  return names.every((name) =>
    new RegExp(String.raw`import\s*\{[^}]*\b${name}\b[^}]*\}\s*from\s*['"]${specPattern}['"]`).test(
      source,
    ),
  );
}

function patchEsmNodeGlobals(dir) {
  for (const file of walkJs(dir)) {
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
