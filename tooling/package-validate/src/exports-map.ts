import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ValidationFinding } from './types.js';

/** Packed-tarball paths that must never ship. */
export const PACK_DENY_PATTERNS: readonly RegExp[] = [
  /^src\//,
  /\.test\.ts$/,
  /^\.turbo\//,
  /\.env/,
  /\.pem$/,
  /CORE_IMPLEMENTATION_PLAN\.md$/,
  /CORE_IMPLEMENTATION_REPORT\.md$/,
  /^dist\/(?:cjs\/|esm\/)?scripts(\/|$)/,
  /^dist\/(?:cjs\/|esm\/)?test(\/|$)/,
  /^dist\/(?:cjs\/|esm\/)?seed(\.|$)/,
  /^dist\/(?:cjs\/|esm\/)?load-optional(\.|$)/,
];

/** Packed tarball size ceilings (bytes). OPTIONAL if exceeded. */
export const PACK_SIZE_BUDGETS: Readonly<Record<string, number>> = {
  '@celestial-ui/tokens': 40 * 1024,
  '@celestial-ui/theme': 20 * 1024,
  '@celestial-ui/styles': 35 * 1024,
  '@celestial-ui/icons': 60 * 1024,
  '@celestial-ui/core': 120 * 1024,
};

/** CSS-exporting packages must not declare sideEffects: false. */
export const CSS_SIDEEFFECT_PACKAGES: ReadonlySet<string> = new Set([
  '@celestial-ui/tokens',
  '@celestial-ui/styles',
]);

/** JS-only packages that are side-effect free and must declare it for tree-shaking. */
export const SIDE_EFFECT_FREE_PACKAGES: ReadonlySet<string> = new Set([
  '@celestial-ui/theme',
  '@celestial-ui/icons',
  '@celestial-ui/core',
]);

const RELATIVE_SPECIFIER_RE = /(?:from\s+|import\s*\(\s*|import\s+)(['"])(\.\.?\/[^'"]+)\1/g;
const ESM_FILE_EXT = /\.(?:js|mjs|cjs|json|css|node|svg)$/;

export const CORE_SPEC_EXPORT_PREFIX = './specs/';
export const CORE_EXPECTED_SPEC_COUNT = 103;

/** Subpaths that must exist on the public export map. Extra keys are allowed if files exist. */
export const EXPECTED_SUBPATHS: Readonly<Record<string, readonly string[]>> = {
  '@celestial-ui/tokens': [
    '.',
    './css',
    './tailwind',
    './shadcn',
    './types',
    './resolve',
    './catalog',
    './a11y',
    './validation',
    './generators',
  ],
  '@celestial-ui/theme': [
    '.',
    './themes/celestial',
    './mode',
    './registry',
    './resolve',
    './slots',
    './validate',
  ],
  '@celestial-ui/styles': [
    '.',
    './css',
    './base',
    './tailwind',
    './shadcn',
    './runtime',
    './ssr',
    './compiler',
    './bridges/tailwind',
    './bridges/shadcn',
    './bridges/base',
  ],
  '@celestial-ui/icons': [
    '.',
    './providers/lucide',
    './providers/font-awesome',
    './providers/material',
    './providers/heroicons',
    './providers/phosphor',
    './providers/iconify',
  ],
  '@celestial-ui/core': [
    '.',
    './contracts',
    './behavior',
    './accessibility',
    './collection',
    './overlay',
    './runtime',
    './catalog',
    './testing',
  ],
};

export const BARREL_ISOLATION: Readonly<
  Record<string, { readonly file: string; readonly forbidden: readonly string[] }>
> = {
  '@celestial-ui/core': {
    file: 'src/index.ts',
    forbidden: ['./testing', './catalog', './specs/'],
  },
  '@celestial-ui/icons': {
    file: 'src/index.ts',
    forbidden: ['./providers/'],
  },
};

const EXPORT_CONDITION_ORDER = ['default', 'require', 'import', 'types'] as const;

/**
 * Collects every relative file target from a package.json exports entry.
 * Walks string targets and nested `import` / `require` / `default` / `types` objects.
 */
export function resolveExportPaths(exportValue: unknown): string[] {
  const found: string[] = [];
  const seen = new Set<unknown>();
  walkExportValue(exportValue, found, seen);
  return [...new Set(found)];
}

/**
 * Resolves a package.json exports entry to a representative relative file path.
 * Prefers `default`, then `require`, then `import` (including nested condition objects).
 */
export function resolveExportPath(exportValue: unknown): string | null {
  return resolveExportPaths(exportValue)[0] ?? null;
}

function walkExportValue(value: unknown, found: string[], seen: Set<unknown>): void {
  if (typeof value === 'string') {
    if (value.startsWith('.')) found.push(value);
    return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value) || seen.has(value)) {
    return;
  }
  seen.add(value);
  const record = value as Record<string, unknown>;
  const keys = [
    ...EXPORT_CONDITION_ORDER.filter((key) => key in record),
    ...Object.keys(record).filter(
      (key) => !(EXPORT_CONDITION_ORDER as readonly string[]).includes(key),
    ),
  ];
  for (const key of keys) {
    walkExportValue(record[key], found, seen);
  }
}

/** Joins `resolveExportPath` onto a package root (source tree or packed tarball). */
export function resolveExportTargetFile(pkgRoot: string, exportValue: unknown): string | null {
  const relative = resolveExportPath(exportValue);
  if (!relative) return null;
  return path.join(pkgRoot, relative);
}

export function packedFileIsDenied(file: string): boolean {
  return PACK_DENY_PATTERNS.some((pattern) => pattern.test(file));
}

export function collectExportMapFindings(
  packageName: string,
  exportsMap: Record<string, unknown> | undefined,
  packedRoot: string,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  if (!exportsMap) {
    findings.push({
      package: packageName,
      category: 'exports',
      severity: 'BLOCKER',
      reason: 'Packed package.json is missing an exports map',
      remediation: 'Declare exports in package.json',
    });
    return findings;
  }

  const expected = EXPECTED_SUBPATHS[packageName];
  if (expected) {
    for (const subpath of expected) {
      if (exportsMap[subpath] === undefined) {
        findings.push({
          package: packageName,
          category: 'exports',
          severity: 'BLOCKER',
          reason: `Export map is missing required subpath ${subpath}`,
          remediation: 'Add the subpath to package.json exports',
        });
      }
    }
  }

  if (packageName === '@celestial-ui/core') {
    const specKeys = Object.keys(exportsMap).filter((key) =>
      key.startsWith(CORE_SPEC_EXPORT_PREFIX),
    );
    if (specKeys.length !== CORE_EXPECTED_SPEC_COUNT) {
      findings.push({
        package: packageName,
        category: 'exports',
        severity: 'BLOCKER',
        reason: `Expected ${CORE_EXPECTED_SPEC_COUNT} ${CORE_SPEC_EXPORT_PREFIX}* exports, found ${specKeys.length}`,
        remediation: 'Keep all 103 component spec subpaths',
      });
    }
  }

  for (const [subpath, value] of Object.entries(exportsMap)) {
    const targets = resolveExportPaths(value);
    for (const target of targets) {
      const packedTarget = path.join(packedRoot, target);
      if (!fs.existsSync(packedTarget)) {
        findings.push({
          package: packageName,
          category: 'exports',
          severity: 'BLOCKER',
          reason: `Export ${subpath} points to missing file ${target}`,
          remediation: 'Build the package and ensure export targets exist in dist',
        });
      }
    }
  }

  return findings;
}

export function collectSideEffectsFindings(
  packageName: string,
  packedPkgJson: Record<string, unknown>,
): ValidationFinding[] {
  if (CSS_SIDEEFFECT_PACKAGES.has(packageName)) {
    if (packedPkgJson.sideEffects === false) {
      return [
        {
          package: packageName,
          category: 'exports',
          severity: 'BLOCKER',
          reason: 'sideEffects must not be false; CSS subpath imports are side effects',
          remediation: 'Omit sideEffects or list CSS globs; never set false on tokens/styles',
        },
      ];
    }
    return [];
  }
  if (SIDE_EFFECT_FREE_PACKAGES.has(packageName) && packedPkgJson.sideEffects !== false) {
    return [
      {
        package: packageName,
        category: 'exports',
        severity: 'BLOCKER',
        reason: 'JS-only package must declare sideEffects: false for tree-shaking',
        remediation: 'Set sideEffects to false when the package has no module-level side effects',
      },
    ];
  }
  return [];
}

function collectRelativeSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  RELATIVE_SPECIFIER_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = RELATIVE_SPECIFIER_RE.exec(source))) {
    const specifier = match[2];
    if (specifier) specifiers.push(specifier);
  }
  return specifiers;
}

function walkPackedFiles(dir: string, prefix = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPackedFiles(full, rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

/** Packed ESM must use explicit .js extensions so Node native import works. */
export function collectEsmExtensionFindings(
  packageName: string,
  packedRoot: string,
): ValidationFinding[] {
  const esmDir = path.join(packedRoot, 'dist/esm');
  if (!fs.existsSync(esmDir)) {
    return [
      {
        package: packageName,
        category: 'exports',
        severity: 'BLOCKER',
        reason: 'Packed package is missing dist/esm',
        remediation: 'Run the dual CJS/ESM build before packing',
      },
    ];
  }

  const findings: ValidationFinding[] = [];
  for (const rel of walkPackedFiles(esmDir)) {
    if (!rel.endsWith('.js') && !rel.endsWith('.d.ts')) continue;
    const source = fs.readFileSync(path.join(esmDir, rel), 'utf8');
    for (const specifier of collectRelativeSpecifiers(source)) {
      if (!ESM_FILE_EXT.test(specifier)) {
        findings.push({
          package: packageName,
          category: 'exports',
          severity: 'BLOCKER',
          reason: `dist/esm/${rel} has extensionless relative specifier "${specifier}"`,
          remediation: 'Rewrite ESM relative imports to .js or /index.js after tsc emit',
        });
      }
    }
  }
  return findings;
}

export function collectBarrelIsolationFindings(
  packageName: string,
  packageDirectory: string,
): ValidationFinding[] {
  const rule = BARREL_ISOLATION[packageName];
  if (!rule) return [];

  const sourcePath = path.join(packageDirectory, rule.file);
  if (!fs.existsSync(sourcePath)) {
    return [
      {
        package: packageName,
        category: 'exports',
        severity: 'BLOCKER',
        reason: `Barrel isolation source missing: ${rule.file}`,
        remediation: `Restore ${rule.file}`,
      },
    ];
  }

  const source = fs.readFileSync(sourcePath, 'utf8');
  const findings: ValidationFinding[] = [];
  for (const fragment of rule.forbidden) {
    if (source.includes(fragment)) {
      findings.push({
        package: packageName,
        category: 'exports',
        severity: 'BLOCKER',
        reason: `Root barrel ${rule.file} must not contain ${fragment}`,
        remediation: 'Keep catalog, specs, testing, and icon providers on granular subpaths',
      });
    }
  }
  return findings;
}

export function collectPackSizeFindings(
  packageName: string,
  tarballSize: number,
): ValidationFinding[] {
  const budget = PACK_SIZE_BUDGETS[packageName];
  if (budget === undefined || tarballSize <= budget) {
    return [];
  }
  return [
    {
      package: packageName,
      category: 'artifacts',
      severity: 'OPTIONAL',
      reason: `Tarball size ${tarballSize} bytes exceeds budget ${budget} bytes`,
      remediation: 'Review packed files for accidental inclusions',
    },
  ];
}
