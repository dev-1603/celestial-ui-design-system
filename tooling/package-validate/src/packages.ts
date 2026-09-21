import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageInfo } from './types.js';

const PUBLIC_PACKAGE_NAMES = new Set([
  '@celestial-ui/tokens',
  '@celestial-ui/theme',
  '@celestial-ui/styles',
  '@celestial-ui/icons',
  '@celestial-ui/core',
]);

export function getRepoRoot(): string {
  return path.resolve(import.meta.dirname, '../../..');
}

function readPackageVersion(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? value : '0.0.0';
}

export function discoverPackages(repoRoot: string): PackageInfo[] {
  const roots = [
    path.join(repoRoot, 'packages'),
    path.join(repoRoot, 'tooling'),
    path.join(repoRoot, 'apps'),
  ];

  const packages: PackageInfo[] = [];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgDir = path.join(root, entry.name);
      const pkgJsonPath = path.join(pkgDir, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) continue;

      const packageJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')) as Record<
        string,
        unknown
      >;
      const name = String(packageJson.name ?? entry.name);
      const isPrivate = Boolean(packageJson.private);
      const publishable = PUBLIC_PACKAGE_NAMES.has(name) && !isPrivate;

      packages.push({
        name,
        directory: pkgDir,
        version: readPackageVersion(packageJson.version),
        private: isPrivate,
        publishable,
        packageJson,
      });
    }
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

export function getPublicPackages(packages: PackageInfo[]): PackageInfo[] {
  return packages.filter((pkg) => pkg.publishable);
}
