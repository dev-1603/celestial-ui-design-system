import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageInfo, ValidationFinding } from './types.js';

const REQUIRED_README_SECTIONS = ['install', 'usage', 'documentation'];

export function validateDocumentation(
  repoRoot: string,
  publicPackages: PackageInfo[],
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  const centralDocs = [
    'docs/package-usage.md',
    'docs/build-and-validate.md',
    'docs/registries.md',
    'docs/compatibility-matrix.md',
    'docs/frozen-packages.md',
  ];

  for (const doc of centralDocs) {
    const fullPath = path.join(repoRoot, doc);
    if (!fs.existsSync(fullPath)) {
      findings.push({
        package: '(monorepo)',
        category: 'documentation',
        severity: 'REQUIRED',
        reason: `Missing central documentation file: ${doc}`,
        remediation: `Create ${doc}`,
      });
    }
  }

  const rootReadme = path.join(repoRoot, 'README.md');
  if (fs.existsSync(rootReadme)) {
    const content = fs.readFileSync(rootReadme, 'utf8').toLowerCase();
    if (content.includes('only repository tooling')) {
      findings.push({
        package: '(monorepo)',
        category: 'documentation',
        severity: 'REQUIRED',
        reason: 'Root README still describes the repo as tooling-only',
        remediation: 'Update README.md with package ecosystem overview',
      });
    }
  }

  for (const pkg of publicPackages) {
    const readmePath = path.join(pkg.directory, 'README.md');
    if (!fs.existsSync(readmePath)) {
      findings.push({
        package: pkg.name,
        category: 'documentation',
        severity: 'REQUIRED',
        reason: 'Missing package README.md',
        remediation: 'Add README.md with install, usage, and documentation links',
      });
      continue;
    }

    const readme = fs.readFileSync(readmePath, 'utf8').toLowerCase();
    if (!readme.includes('docs/package-usage.md')) {
      findings.push({
        package: pkg.name,
        category: 'documentation',
        severity: 'REQUIRED',
        reason: 'Package README does not link to docs/package-usage.md',
        remediation: 'Add a Detailed documentation section linking to ../../docs/package-usage.md',
      });
    }

    const hasInstall =
      readme.includes('npm install') || readme.includes('pnpm add') || readme.includes('yarn add');
    if (!hasInstall) {
      findings.push({
        package: pkg.name,
        category: 'documentation',
        severity: 'OPTIONAL',
        reason: 'Package README missing install instructions',
        remediation: 'Add npm/pnpm install examples',
      });
    }
  }

  for (const doc of centralDocs) {
    const fullPath = path.join(repoRoot, doc);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const linkMatches = content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g);
    for (const match of linkMatches) {
      const target = match[1];
      if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#')) {
        continue;
      }
      const resolved = path.resolve(path.dirname(fullPath), target);
      if (!fs.existsSync(resolved)) {
        findings.push({
          package: '(monorepo)',
          category: 'documentation',
          severity: 'REQUIRED',
          reason: `Broken relative link in ${doc}: ${target}`,
          remediation: `Fix or create the linked file at ${target}`,
        });
      }
    }
  }

  return findings;
}
