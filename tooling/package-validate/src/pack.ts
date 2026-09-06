import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { extract } from 'tar';
import type { PackageInfo, ValidationFinding } from './types.js';

const DENY_PATTERNS = [
  /^src\//,
  /\.test\.ts$/,
  /^\.turbo\//,
  /\.env/,
  /\.pem$/,
  /CORE_IMPLEMENTATION_PLAN\.md$/,
  /CORE_IMPLEMENTATION_REPORT\.md$/,
];

function resolveExportTarget(pkgRoot: string, exportValue: unknown): string | null {
  if (typeof exportValue === 'string') {
    return exportValue;
  }
  if (exportValue && typeof exportValue === 'object') {
    const record = exportValue as Record<string, string>;
    if (record.default) return record.default;
  }
  return null;
}

function walkFiles(dir: string, prefix = ''): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full, rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

export async function packAndValidatePackage(
  repoRoot: string,
  pkg: PackageInfo,
  artifactsDir: string,
): Promise<ValidationFinding[]> {
  const findings: ValidationFinding[] = [];

  fs.mkdirSync(artifactsDir, { recursive: true });

  let packOutput = '';
  try {
    packOutput = execSync(`pnpm pack --pack-destination "${artifactsDir}"`, {
      cwd: pkg.directory,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (error) {
    const err = error as { stderr?: string; message?: string };
    findings.push({
      package: pkg.name,
      category: 'artifacts',
      severity: 'BLOCKER',
      reason: `pnpm pack failed: ${err.stderr ?? err.message ?? 'unknown error'}`,
      remediation: 'Fix build/pack errors before release',
    });
    return findings;
  }

  const tarballLine = packOutput.trim().split('\n').pop()?.trim() ?? '';
  if (!tarballLine) {
    findings.push({
      package: pkg.name,
      category: 'artifacts',
      severity: 'BLOCKER',
      reason: 'pnpm pack did not return a tarball path',
      remediation: 'Investigate pnpm pack output',
    });
    return findings;
  }

  const tarballPath = path.isAbsolute(tarballLine)
    ? tarballLine
    : path.join(artifactsDir, tarballLine);
  if (!fs.existsSync(tarballPath)) {
    findings.push({
      package: pkg.name,
      category: 'artifacts',
      severity: 'BLOCKER',
      reason: `Packed tarball not found at ${tarballPath}`,
      remediation: 'Ensure pnpm pack writes to the artifacts directory',
    });
    return findings;
  }

  const extractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'celestial-pack-'));
  await extract({ file: tarballPath, cwd: extractDir });

  const packedRoot = path.join(extractDir, 'package');
  const packedPkgJson = JSON.parse(
    fs.readFileSync(path.join(packedRoot, 'package.json'), 'utf8'),
  ) as Record<string, unknown>;

  const allFiles = walkFiles(packedRoot);

  if (!allFiles.includes('LICENSE')) {
    findings.push({
      package: pkg.name,
      category: 'artifacts',
      severity: 'BLOCKER',
      reason: 'Packed tarball is missing LICENSE',
      remediation: 'Add LICENSE to the package directory',
    });
  }

  if (!allFiles.some((file) => file === 'README.md' || file.startsWith('README'))) {
    findings.push({
      package: pkg.name,
      category: 'artifacts',
      severity: 'REQUIRED',
      reason: 'Packed tarball is missing README',
      remediation: 'Add README.md to the package directory',
    });
  }

  const serialized = JSON.stringify(packedPkgJson);
  if (serialized.includes('workspace:')) {
    findings.push({
      package: pkg.name,
      category: 'artifacts',
      severity: 'BLOCKER',
      reason: 'Packed package.json still contains workspace:* protocol',
      remediation: 'Ensure pnpm pack rewrites workspace dependencies',
    });
  }

  for (const file of allFiles) {
    for (const pattern of DENY_PATTERNS) {
      if (pattern.test(file)) {
        findings.push({
          package: pkg.name,
          category: 'security',
          severity: 'BLOCKER',
          reason: `Packed tarball contains disallowed file: ${file}`,
          remediation: 'Tighten package files field or .npmignore',
        });
      }
    }
  }

  if (pkg.name === '@celestial-ui/tokens') {
    const dataFiles = allFiles.filter((file) => file.startsWith('data/'));
    if (dataFiles.length === 0) {
      findings.push({
        package: pkg.name,
        category: 'artifacts',
        severity: 'BLOCKER',
        reason: 'Tokens tarball must include data/ for getCanonicalTokenSources()',
        remediation: 'Add data to package.json files field',
      });
    }
  }

  const exportsMap = packedPkgJson.exports as Record<string, unknown> | undefined;
  if (exportsMap) {
    for (const [subpath, value] of Object.entries(exportsMap)) {
      const target = resolveExportTarget('.', value);
      if (!target) continue;
      const packedTarget = path.join(packedRoot, target);
      if (!fs.existsSync(packedTarget)) {
        findings.push({
          package: pkg.name,
          category: 'exports',
          severity: 'BLOCKER',
          reason: `Export ${subpath} points to missing file ${target}`,
          remediation: 'Build the package and ensure export targets exist in dist',
        });
      }
    }
  }

  const publishConfig = packedPkgJson.publishConfig as { access?: string } | undefined;
  if (publishConfig?.access !== 'public') {
    findings.push({
      package: pkg.name,
      category: 'registry',
      severity: 'REQUIRED',
      reason: 'publishConfig.access is not public',
      remediation: 'Set publishConfig.access to public for npm publishing',
    });
  }

  const tarballSize = fs.statSync(tarballPath).size;
  const maxSize = pkg.name === '@celestial-ui/tokens' ? 2 * 1024 * 1024 : 1024 * 1024;
  if (tarballSize > maxSize) {
    findings.push({
      package: pkg.name,
      category: 'artifacts',
      severity: 'OPTIONAL',
      reason: `Tarball size ${tarballSize} bytes exceeds soft budget ${maxSize} bytes`,
      remediation: 'Review packed files for accidental inclusions',
    });
  }

  return findings;
}

export function validateChangesetsAccess(repoRoot: string): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const configPath = path.join(repoRoot, '.changeset', 'config.json');
  if (!fs.existsSync(configPath)) {
    findings.push({
      package: '(monorepo)',
      category: 'registry',
      severity: 'BLOCKER',
      reason: 'Missing .changeset/config.json',
      remediation: 'Initialize Changesets configuration',
    });
    return findings;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as { access?: string };
  if (config.access !== 'public') {
    findings.push({
      package: '(monorepo)',
      category: 'registry',
      severity: 'BLOCKER',
      reason: `Changesets access is "${config.access ?? 'unset'}" instead of public`,
      remediation: 'Set access to public in .changeset/config.json',
    });
  }

  return findings;
}
