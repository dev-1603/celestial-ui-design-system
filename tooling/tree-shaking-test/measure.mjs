import * as esbuild from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const KB = 1024;
const fixtureDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(fixtureDir, 'out');
fs.mkdirSync(distDir, { recursive: true });

const FS_RE = /readFileSync|node:fs|require\(["']fs["']\)|from["']fs["']|from["']node:fs["']/;
const PROVIDER_RES = {
  lucide: /lucide-static|LucideAdapter/,
  fontawesome: /fontawesome|FontAwesomeAdapter/,
  material: /MaterialSymbolsAdapter/,
  heroicons: /HeroiconsAdapter/,
  phosphor: /PhosphorAdapter/,
  iconify: /IconifyAdapter/,
};

/**
 * @typedef {object} ShakeCase
 * @property {string} name
 * @property {string} code
 * @property {'browser' | 'node'} [platform]
 * @property {number} [maxGzip]
 * @property {boolean} [smoke]
 * @property {boolean} [informational]
 * @property {boolean} [forbidFs]
 * @property {string[]} [forbidProviders]
 * @property {string[]} [forbidText]
 */

/** @type {ShakeCase[]} */
const cases = [
  {
    name: 'core/collection createCollection',
    code: `import { createCollection } from '@celestial-ui/core/collection';\nexport { createCollection };`,
    platform: 'browser',
    maxGzip: 3 * KB,
  },
  {
    name: 'core root createCollection',
    code: `import { createCollection } from '@celestial-ui/core';\nexport { createCollection };`,
    platform: 'browser',
    informational: true,
  },
  {
    name: 'core/behavior createDisclosure',
    code: `import { createDisclosure } from '@celestial-ui/core/behavior';\nexport { createDisclosure };`,
    platform: 'browser',
    maxGzip: 3 * KB,
  },
  {
    name: 'core/specs/button',
    code: `import { buttonSpec } from '@celestial-ui/core/specs/button';\nexport { buttonSpec };`,
    platform: 'browser',
    maxGzip: 6 * KB,
  },
  {
    name: 'core/specs/accordion',
    code: `import { accordionSpec } from '@celestial-ui/core/specs/accordion';\nexport { accordionSpec };`,
    platform: 'browser',
    maxGzip: 7 * KB,
  },
  {
    name: 'core/catalog listCatalogEntries',
    code: `import { listCatalogEntries } from '@celestial-ui/core/catalog';\nexport { listCatalogEntries };`,
    platform: 'browser',
    maxGzip: 16 * KB,
    forbidText: ['buttonSpec', 'accordionSpec'],
  },
  {
    name: 'theme/themes/celestial',
    code: `import { CELESTIAL_THEME } from '@celestial-ui/theme/themes/celestial';\nexport { CELESTIAL_THEME };`,
    platform: 'browser',
    maxGzip: 1 * KB,
    forbidFs: true,
  },
  {
    name: 'theme root CELESTIAL_THEME',
    code: `import { CELESTIAL_THEME } from '@celestial-ui/theme';\nexport { CELESTIAL_THEME };`,
    platform: 'browser',
    maxGzip: 2 * KB,
    forbidFs: true,
  },
  {
    name: 'tokens/resolve flattenTokens',
    code: `import { flattenTokens } from '@celestial-ui/tokens/resolve';\nexport { flattenTokens };`,
    platform: 'browser',
    maxGzip: 2 * KB,
    forbidFs: true,
  },
  {
    name: 'tokens root flattenTokens',
    code: `import { flattenTokens } from '@celestial-ui/tokens';\nexport { flattenTokens };`,
    platform: 'browser',
    maxGzip: 2 * KB,
    forbidFs: true,
  },
  {
    name: 'tokens/a11y getContrastRatio',
    code: `import { getContrastRatio } from '@celestial-ui/tokens/a11y';\nexport { getContrastRatio };`,
    platform: 'browser',
    maxGzip: 2 * KB,
    forbidFs: true,
  },
  {
    name: 'tokens root getCanonicalTokenSources',
    code: `import { getCanonicalTokenSources } from '@celestial-ui/tokens';\nexport { getCanonicalTokenSources };`,
    platform: 'node',
    smoke: true,
  },
  {
    name: 'styles/runtime',
    code: `import { createThemeStyleManager } from '@celestial-ui/styles/runtime';\nexport { createThemeStyleManager };`,
    platform: 'browser',
    maxGzip: 5 * KB,
    forbidText: ['generateShadcnAdapter'],
  },
  {
    name: 'styles root createThemeStyleManager',
    code: `import { createThemeStyleManager } from '@celestial-ui/styles';\nexport { createThemeStyleManager };`,
    platform: 'browser',
    informational: true,
  },
  {
    name: 'styles/compiler compileThemeSet',
    code: `import { compileThemeSet } from '@celestial-ui/styles/compiler';\nexport { compileThemeSet };`,
    platform: 'browser',
    maxGzip: 12 * KB,
  },
  {
    name: 'styles/ssr renderThemeStyleTag',
    code: `import { renderThemeStyleTag } from '@celestial-ui/styles/ssr';\nexport { renderThemeStyleTag };`,
    platform: 'browser',
    maxGzip: 12 * KB,
  },
  {
    name: 'styles/bridges/tailwind',
    code: `import { generateTailwindBridge } from '@celestial-ui/styles/bridges/tailwind';\nexport { generateTailwindBridge };`,
    platform: 'browser',
    maxGzip: 4 * KB,
  },
  {
    name: 'styles/bridges/shadcn',
    code: `import { generateShadcnAdapter } from '@celestial-ui/styles/bridges/shadcn';\nexport { generateShadcnAdapter };`,
    platform: 'browser',
    maxGzip: 4 * KB,
  },
  {
    name: 'icons resolveIcon',
    code: `import { resolveIcon } from '@celestial-ui/icons';\nexport { resolveIcon };`,
    platform: 'browser',
    maxGzip: 10 * KB,
    forbidProviders: ['lucide', 'fontawesome', 'material', 'heroicons', 'phosphor', 'iconify'],
  },
  {
    name: 'icons/providers/lucide',
    code: `import { LucideAdapter } from '@celestial-ui/icons/providers/lucide';\nexport { LucideAdapter };`,
    platform: 'browser',
    maxGzip: 12 * KB,
    forbidFs: true,
    forbidProviders: ['fontawesome', 'material', 'heroicons', 'phosphor', 'iconify'],
  },
  {
    name: 'icons/providers/heroicons',
    code: `import { HeroiconsAdapter } from '@celestial-ui/icons/providers/heroicons';\nexport { HeroiconsAdapter };`,
    platform: 'browser',
    maxGzip: 50 * KB,
    forbidFs: true,
    forbidProviders: ['lucide', 'fontawesome', 'material', 'phosphor', 'iconify'],
  },
  {
    name: 'theme/resolve',
    code: `import { resolveTheme } from '@celestial-ui/theme/resolve';\nexport { resolveTheme };`,
    platform: 'node',
    smoke: true,
  },
  {
    name: 'tokens/catalog',
    code: `import { getCanonicalTokenSources } from '@celestial-ui/tokens/catalog';\nexport { getCanonicalTokenSources };`,
    platform: 'node',
    smoke: true,
  },
];

/**
 * @param {string} code
 * @param {ShakeCase} c
 */
function collectLeaks(code, c) {
  /** @type {string[]} */
  const leaks = [];
  if (c.forbidFs && FS_RE.test(code)) {
    leaks.push('fs');
  }
  for (const id of c.forbidProviders ?? []) {
    if (PROVIDER_RES[id].test(code)) {
      leaks.push(`provider:${id}`);
    }
  }
  for (const needle of c.forbidText ?? []) {
    if (code.includes(needle)) {
      leaks.push(needle);
    }
  }
  return leaks;
}

function formatBytes(n) {
  return `${(n / KB).toFixed(2)}KB`;
}

/**
 * @param {ShakeCase} c
 */
async function runCase(c) {
  const outfile = path.join(distDir, c.name.replace(/[^\w]+/g, '-') + '.js');
  const platform = c.platform ?? 'browser';
  const minify = platform === 'browser' && !c.smoke;

  try {
    const build = await esbuild.build({
      stdin: {
        contents: c.code,
        resolveDir: fixtureDir,
        sourcefile: `${c.name.replace(/[^\w]+/g, '-')}.js`,
      },
      bundle: true,
      minify,
      format: 'esm',
      write: true,
      outfile,
      platform,
      treeShaking: true,
      logLevel: 'silent',
      metafile: true,
      packages: 'bundle',
      absWorkingDir: fixtureDir,
    });
    const buf = fs.readFileSync(outfile);
    const gzip = zlib.gzipSync(buf).length;
    const brotli = zlib.brotliCompressSync(buf).length;
    const text = buf.toString('utf8');
    const inputs = Object.keys(Object.values(build.metafile.outputs)[0].inputs);
    const leaks = c.informational || c.smoke ? [] : collectLeaks(text, c);
    /** @type {string[]} */
    const failures = [];

    if (!c.informational && !c.smoke && c.maxGzip !== undefined && gzip > c.maxGzip) {
      failures.push(`gzip ${formatBytes(gzip)} exceeds ${formatBytes(c.maxGzip)}`);
    }
    if (leaks.length > 0) {
      failures.push(`leak ${leaks.join(', ')}`);
    }

    return {
      name: c.name,
      ok: failures.length === 0,
      informational: Boolean(c.informational),
      smoke: Boolean(c.smoke),
      minified: buf.length,
      gzip,
      brotli,
      maxGzip: c.maxGzip,
      modules: inputs.length,
      leaks,
      failures,
      hasFs: FS_RE.test(text),
    };
  } catch (err) {
    const message = String(err.errors?.[0]?.text ?? err.message ?? err).slice(0, 400);
    if (c.informational) {
      return {
        name: c.name,
        ok: true,
        informational: true,
        smoke: false,
        error: message,
        failures: [],
        leaks: [],
      };
    }
    return {
      name: c.name,
      ok: false,
      informational: false,
      smoke: Boolean(c.smoke),
      error: message,
      failures: [c.smoke ? `compile-smoke failed: ${message}` : message],
      leaks: [],
    };
  }
}

const results = [];
for (const c of cases) {
  results.push(await runCase(c));
}

const gated = results.filter((r) => !r.informational);
const failed = gated.filter((r) => !r.ok);

/**
 * @param {typeof results[number]} r
 */
function formatTag(r) {
  if (r.informational) return 'INFO';
  return r.ok ? 'PASS' : 'FAIL';
}

/**
 * @param {typeof results[number]} r
 */
function formatSize(r) {
  if (r.minified === undefined) {
    return r.smoke ? 'compile-smoke' : '';
  }
  const limit = r.maxGzip !== undefined ? ` / ${formatBytes(r.maxGzip)}` : '';
  return `min ${formatBytes(r.minified)} gzip ${formatBytes(r.gzip)}${limit} br ${formatBytes(r.brotli)}`;
}

/**
 * @param {typeof results[number]} r
 */
function formatExtra(r) {
  if (r.failures?.length) {
    return ` — ${r.failures.join('; ')}`;
  }
  if (r.informational && r.hasFs) {
    return ' — root+fs (not a CI blocker)';
  }
  if (r.informational && r.error) {
    return ` — ${r.error}`;
  }
  if (r.smoke && r.ok) {
    return ' — compile-smoke';
  }
  return '';
}

for (const r of results) {
  const tag = formatTag(r);
  const size = formatSize(r);
  const extra = formatExtra(r);
  console.log(`${tag.padEnd(4)} ${r.name.padEnd(42)} ${size}${extra}`);
}

if (failed.length > 0) {
  console.error(
    `\nshake:test failed (${failed.length} gated case${failed.length === 1 ? '' : 's'})`,
  );
  process.exit(1);
}

console.log('\nshake:test passed');
