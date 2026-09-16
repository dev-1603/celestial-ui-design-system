#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { validateDocumentation } from './docs.js';
import { validateDependencyGraph } from './graph.js';
import { packAndValidatePackage, validateChangesetsAccess } from './pack.js';
import { discoverPackages, getPublicPackages, getRepoRoot } from './packages.js';
import { buildReport, formatMarkdownReport } from './report.js';
import type { ValidationFinding } from './types.js';

function parseArgs(argv: string[]): { skipPack: boolean; skipDocs: boolean } {
  return {
    skipPack: argv.includes('--skip-pack'),
    skipDocs: argv.includes('--skip-docs'),
  };
}

/** Resolve pnpm by absolute path so the CLI never shells out via PATH. */
function resolvePnpmExecutable(repoRoot: string): string | undefined {
  const binName = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const candidates = [
    path.join(repoRoot, 'node_modules', '.bin', binName),
    process.env.PNPM_HOME ? path.join(process.env.PNPM_HOME, binName) : undefined,
    path.join(path.dirname(process.execPath), binName),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      if (fs.existsSync(candidate)) {
        return fs.realpathSync(candidate);
      }
    } catch {
      continue;
    }
  }

  return undefined;
}

async function main(): Promise<void> {
  const { skipPack, skipDocs } = parseArgs(process.argv.slice(2));
  const repoRoot = getRepoRoot();
  const packages = discoverPackages(repoRoot);
  const publicPackages = getPublicPackages(packages);
  const privatePackages = packages.filter((pkg) => pkg.private);
  const internalPackages = privatePackages.filter((pkg) => !pkg.publishable);

  const findings: ValidationFinding[] = [];

  findings.push(...validateDependencyGraph(packages), ...validateChangesetsAccess(repoRoot));

  if (!skipDocs) {
    findings.push(...validateDocumentation(repoRoot, publicPackages));
  }

  if (!skipPack) {
    const artifactsDir = path.join(repoRoot, 'artifacts');
    const pnpmBin = resolvePnpmExecutable(repoRoot);
    if (!pnpmBin) {
      findings.push({
        package: 'workspace',
        category: 'build',
        severity: 'BLOCKER',
        reason:
          'Unable to resolve an absolute pnpm executable (workspace .bin, PNPM_HOME, or Node bindir)',
        remediation: 'Install pnpm locally or set PNPM_HOME to a trusted directory',
      });
    } else {
      for (const pkg of publicPackages) {
        try {
          execFileSync(pnpmBin, ['build'], { cwd: pkg.directory, stdio: 'pipe' });
        } catch (error) {
          const err = error as { stderr?: string; message?: string };
          findings.push({
            package: pkg.name,
            category: 'build',
            severity: 'BLOCKER',
            reason: `Build failed: ${err.stderr ?? err.message ?? 'unknown error'}`,
            remediation: 'Fix build errors before packaging',
          });
          continue;
        }

        const packFindings = await packAndValidatePackage(repoRoot, pkg, artifactsDir);
        findings.push(...packFindings);
      }
    }
  }

  const report = buildReport({
    packagesDiscovered: packages.length,
    publicPackages: publicPackages.length,
    privatePackages: privatePackages.length,
    internalPackages: internalPackages.length,
    findings,
  });

  const reportsDir = path.join(repoRoot, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'validation.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(reportsDir, 'validation.md'), formatMarkdownReport(report));

  console.log(formatMarkdownReport(report));

  if (report.overall !== 'RELEASE_READY') {
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
