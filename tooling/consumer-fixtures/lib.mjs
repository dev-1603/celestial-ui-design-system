#!/usr/bin/env node
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, '../..');
export const artifactsDir = path.join(repoRoot, 'artifacts');
export const fixturesDir = path.join(__dirname, 'fixtures');

export const PUBLIC_PACKAGES = [
  '@celestial-ui/tokens',
  '@celestial-ui/theme',
  '@celestial-ui/styles',
  '@celestial-ui/icons',
  '@celestial-ui/core',
];

export function run(cmd, cwd, env = process.env) {
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

export function packAll() {
  fs.mkdirSync(artifactsDir, { recursive: true });
  const tarballs = new Map();

  for (const pkgName of PUBLIC_PACKAGES) {
    const pkgDir = path.join(repoRoot, 'packages', pkgName.replace('@celestial-ui/', ''));
    run('pnpm build', pkgDir);
    const output = execSync(`pnpm pack --pack-destination "${artifactsDir}"`, {
      cwd: pkgDir,
      encoding: 'utf8',
    });
    const tarball = output.trim().split('\n').pop().trim();
    const tarballPath = path.isAbsolute(tarball) ? tarball : path.join(artifactsDir, tarball);
    tarballs.set(pkgName, tarballPath);
  }

  return tarballs;
}

export function writeTarballDependencies(projectDir, packageNames, tarballs) {
  const tarballDir = path.join(projectDir, 'tarballs');
  fs.mkdirSync(tarballDir, { recursive: true });

  const overrides = {};
  const dependencies = {};
  for (const name of packageNames) {
    const src = tarballs.get(name);
    if (!src) {
      throw new Error(`Missing packed tarball for ${name}`);
    }
    const destName = `${name.replace('@celestial-ui/', '')}.tgz`;
    const dest = path.join(tarballDir, destName);
    fs.copyFileSync(src, dest);
    const fileSpec = `file:./tarballs/${destName}`;
    dependencies[name] = fileSpec;
    overrides[name] = fileSpec;
  }

  const pkgPath = path.join(projectDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.dependencies = { ...(pkg.dependencies ?? {}), ...dependencies };
  pkg.pnpm = { ...(pkg.pnpm ?? {}), overrides };
  if (!pkg.overrides) {
    pkg.overrides = overrides;
  } else {
    pkg.overrides = { ...pkg.overrides, ...overrides };
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}
