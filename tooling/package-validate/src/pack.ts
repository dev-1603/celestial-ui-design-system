import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { extract } from 'tar';
import {
  collectBarrelIsolationFindings,
  collectEsmExtensionFindings,
  collectExportMapFindings,
  collectPackSizeFindings,
  collectSideEffectsFindings,
  packedFileIsDenied,
} from './exports-map.js';
import type { PackageInfo, ValidationFinding } from './types.js';

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
    if (packedFileIsDenied(file)) {
      findings.push({
        package: pkg.name,
        category: 'security',
        severity: 'BLOCKER',
        reason: `Packed tarball contains disallowed file: ${file}`,
        remediation: 'Tighten package files field or .npmignore',
      });
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

  findings.push(
    ...collectExportMapFindings(
      pkg.name,
      packedPkgJson.exports as Record<string, unknown> | undefined,
      packedRoot,
    ),
  );
  findings.push(...collectSideEffectsFindings(pkg.name, packedPkgJson));
  findings.push(...collectEsmExtensionFindings(pkg.name, packedRoot));
  findings.push(...collectBarrelIsolationFindings(pkg.name, pkg.directory));
  findings.push(...(await collectNativeEsmImportFindings(pkg.name, packedPkgJson, packedRoot)));

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

  findings.push(...collectPackSizeFindings(pkg.name, fs.statSync(tarballPath).size));

  return findings;
}

async function collectNativeEsmImportFindings(
  packageName: string,
  packedPkgJson: Record<string, unknown>,
  packedRoot: string,
): Promise<ValidationFinding[]> {
  const runtimeDeps = packedPkgJson.dependencies as Record<string, string> | undefined;
  if (runtimeDeps && Object.keys(runtimeDeps).length > 0) {
    return [];
  }
  const esmEntry = path.join(packedRoot, 'dist/esm/index.js');
  if (!fs.existsSync(esmEntry)) {
    return [];
  }
  try {
    await import(pathToFileURL(esmEntry).href);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [
      {
        package: packageName,
        category: 'exports',
        severity: 'BLOCKER',
        reason: `Native Node ESM import of packed dist/esm/index.js failed: ${message}`,
        remediation:
          'Ensure ESM relative specifiers include .js extensions and Node globals are patched',
      },
    ];
  }
  return [];
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
