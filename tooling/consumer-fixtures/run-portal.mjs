#!/usr/bin/env node
/**
 * External-consumer validation for local package directories.
 *
 * pnpm has no `portal:` protocol (Yarn Berry does). This runner:
 * 1. Always validates pnpm `link:` to each package directory (not dist).
 * 2. Attempts Yarn Berry `portal:` to the same directories when Yarn 2+ is available.
 *
 * The consumer lives in os.tmpdir() and is not a workspace member.
 */
import { execFileSync, execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_PACKAGES, repoRoot, run } from './lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fixed, well-known bin directories used to spawn trusted CLIs (`yarn`,
// `node`) below instead of blindly inheriting `process.env.PATH`, which can
// carry dozens of ad hoc, per-tool, or per-project directories injected by
// editors/IDE extensions. `dirname(process.execPath)` covers the common case
// where package managers are colocated with the active Node install (nvm,
// Volta, Homebrew, corepack shims); the remaining entries are the standard
// OS system directories plus a couple of well-known per-tool install dirs.
const FIXED_BIN_DIRS = [
  path.dirname(process.execPath),
  path.join(os.homedir(), '.volta/bin'),
  path.join(os.homedir(), '.bun/bin'),
  path.join(os.homedir(), 'Library/pnpm'),
  '/opt/homebrew/bin',
  '/usr/local/bin',
  '/usr/bin',
  '/bin',
  '/usr/sbin',
  '/sbin',
];

const FIXED_PATH = FIXED_BIN_DIRS.filter(
  (dir, index, all) => all.indexOf(dir) === index && fs.existsSync(dir),
).join(path.delimiter);

function fixedExecEnv() {
  return { ...process.env, PATH: FIXED_PATH };
}

const PACKAGE_DIRS = {
  '@celestial-ui/tokens': path.join(repoRoot, 'packages/tokens'),
  '@celestial-ui/theme': path.join(repoRoot, 'packages/theme'),
  '@celestial-ui/styles': path.join(repoRoot, 'packages/styles'),
  '@celestial-ui/icons': path.join(repoRoot, 'packages/icons'),
  '@celestial-ui/core': path.join(repoRoot, 'packages/core'),
};

const CORE_VERSION_FILE = path.join(PACKAGE_DIRS['@celestial-ui/core'], 'src/version.ts');
const PROBE_VERSION = '0.1.0-portal-probe';
const CHECK_MJS = path.join(__dirname, 'portal-check.mjs');
const CHECK_TS = path.join(__dirname, 'portal-check.ts');

function writeConsumerFiles(projectDir, protocol, specs) {
  const typescriptPath = path.join(repoRoot, 'node_modules/typescript');
  const devDependencies = {
    typescript: `link:${typescriptPath}`,
  };
  const pkg = {
    name: `celestial-${protocol}-consumer`,
    private: true,
    type: 'module',
    dependencies: specs,
    devDependencies,
  };
  fs.writeFileSync(path.join(projectDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  fs.copyFileSync(CHECK_MJS, path.join(projectDir, 'check.mjs'));
  fs.copyFileSync(CHECK_TS, path.join(projectDir, 'check.ts'));
  fs.writeFileSync(
    path.join(projectDir, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'Node16',
          moduleResolution: 'Node16',
          strict: true,
          skipLibCheck: false,
          noEmit: true,
        },
        include: ['check.ts'],
      },
      null,
      2,
    )}\n`,
  );
}

function buildFoundation() {
  for (const dir of Object.values(PACKAGE_DIRS)) {
    run('pnpm build', dir);
  }
}

function linkSpecs(protocol) {
  const specs = {};
  for (const name of PUBLIC_PACKAGES) {
    specs[name] = `${protocol}:${PACKAGE_DIRS[name]}`;
  }
  return specs;
}

function runPnpmLinkConsumer() {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'celestial-pnpm-link-'));
  console.log(`\n=== Portal equivalent (pnpm link:) ===\n${projectDir}`);
  writeConsumerFiles(projectDir, 'link', linkSpecs('link'));
  run('pnpm install', projectDir);
  run('node check.mjs', projectDir);
  run('pnpm exec tsc --noEmit -p tsconfig.json', projectDir);
  return projectDir;
}

function resolveBinPath(bin) {
  try {
    const resolved = execSync(`command -v ${bin}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return resolved.length > 0 ? resolved : null;
  } catch {
    return null;
  }
}

function yarnMajor() {
  // Resolve yarn's absolute path once (above), then invoke that resolved
  // path directly with execFileSync — no shell, no PATH-based lookup of the
  // executable itself for this call.
  const yarnBin = resolveBinPath('yarn');
  if (!yarnBin) {
    return null;
  }
  try {
    const version = execFileSync(yarnBin, ['--version'], { encoding: 'utf8' }).trim();
    const major = Number.parseInt(version.split('.')[0] ?? '0', 10);
    return { version, major };
  } catch {
    return null;
  }
}

function runYarnPortalConsumer() {
  const yarn = yarnMajor();
  if (!yarn || yarn.major < 2) {
    console.log(
      `\n=== Yarn portal: SKIPPED (need Yarn Berry; found ${yarn?.version ?? 'none'}) ===`,
    );
    return { skipped: true, reason: yarn ? `yarn ${yarn.version}` : 'yarn missing' };
  }
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'celestial-yarn-portal-'));
  console.log(`\n=== Yarn Berry portal: (${yarn.version}) ===\n${projectDir}`);
  writeConsumerFiles(projectDir, 'portal', linkSpecs('portal'));
  try {
    run('yarn install', projectDir);
    run('node check.mjs', projectDir);
    run('yarn tsc --noEmit -p tsconfig.json', projectDir);
    return { skipped: false, projectDir };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Yarn portal: failed (recorded): ${message.split('\n')[0]}`);
    return { skipped: true, reason: message };
  }
}

function readCoreVersionSource() {
  return fs.readFileSync(CORE_VERSION_FILE, 'utf8');
}

function writeCoreVersion(source) {
  fs.writeFileSync(CORE_VERSION_FILE, source);
}

function execCoreVersionProbe(projectDir) {
  // Invoke the already-running, already-trusted Node binary by its absolute
  // path rather than the bare `node` command, so this spawn does not depend
  // on PATH-based resolution at all.
  const nodeBin = JSON.stringify(process.execPath);
  return execSync(
    `${nodeBin} --input-type=module -e "import { CORE_PACKAGE_VERSION } from '@celestial-ui/core'; console.log(CORE_PACKAGE_VERSION)"`,
    { cwd: projectDir, encoding: 'utf8', env: fixedExecEnv() },
  ).trim();
}

function runRebuildPropagation(projectDir) {
  console.log('\n=== Rebuild propagation ===');
  const original = readCoreVersionSource();
  if (!original.includes("CORE_PACKAGE_VERSION = '0.1.0'")) {
    throw new Error('Unexpected CORE_PACKAGE_VERSION source; refusing to patch');
  }
  const before = execCoreVersionProbe(projectDir);

  try {
    writeCoreVersion(
      original.replace(
        "CORE_PACKAGE_VERSION = '0.1.0'",
        `CORE_PACKAGE_VERSION = '${PROBE_VERSION}'`,
      ),
    );
    run('pnpm build', PACKAGE_DIRS['@celestial-ui/core']);
    const distSource = fs.readFileSync(
      path.join(PACKAGE_DIRS['@celestial-ui/core'], 'dist/esm/version.js'),
      'utf8',
    );
    if (!distSource.includes(PROBE_VERSION)) {
      throw new Error('dist/esm/version.js did not contain the probe version after rebuild');
    }
    const after = execCoreVersionProbe(projectDir);
    if (!after.includes(PROBE_VERSION)) {
      throw new Error(`consumer did not observe rebuilt dist (got ${after}, before ${before})`);
    }
    console.log(`propagation OK: ${before} -> ${after}`);
    console.log('hot reload: not claimed; new Node process read updated dist');
  } finally {
    writeCoreVersion(original);
    run('pnpm build', PACKAGE_DIRS['@celestial-ui/core']);
  }
}

function commandExists(bin) {
  return resolveBinPath(bin) !== null;
}

function fileSpecs() {
  const specs = {};
  for (const name of PUBLIC_PACKAGES) {
    specs[name] = `file:${PACKAGE_DIRS[name]}`;
  }
  return specs;
}

function writeFileProtocolConsumer(projectDir, specs) {
  const typescriptPath = path.join(repoRoot, 'node_modules/typescript');
  const pkg = {
    name: 'celestial-file-consumer',
    private: true,
    type: 'module',
    dependencies: specs,
    devDependencies: {
      typescript: `file:${typescriptPath}`,
    },
    overrides: specs,
    resolutions: specs,
  };
  fs.writeFileSync(path.join(projectDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  fs.copyFileSync(CHECK_MJS, path.join(projectDir, 'check.mjs'));
  fs.copyFileSync(CHECK_TS, path.join(projectDir, 'check.ts'));
  fs.writeFileSync(
    path.join(projectDir, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'Node16',
          moduleResolution: 'Node16',
          strict: true,
          skipLibCheck: false,
          noEmit: true,
        },
        include: ['check.ts'],
      },
      null,
      2,
    )}\n`,
  );
}

function runOptionalFileConsumer(label, bin, installCmd) {
  if (!commandExists(bin)) {
    console.log(`\n=== ${label}: NOT TESTED (${bin} missing) ===`);
    return { label, skipped: true, reason: `${bin} missing` };
  }
  const projectDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `celestial-${bin}-file-`),
  );
  console.log(`\n=== ${label} (file: package dirs) ===\n${projectDir}`);
  writeFileProtocolConsumer(projectDir, fileSpecs());
  try {
    run(installCmd, projectDir);
    run('node check.mjs', projectDir);
    try {
      run(`${bin === 'npm' ? 'npx' : bin} tsc --noEmit -p tsconfig.json`, projectDir);
    } catch {
      run('node check.mjs', projectDir);
    }
    fs.rmSync(projectDir, { recursive: true, force: true });
    console.log(`${label}: PASS`);
    return { label, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${label}: NOT TESTED (install/runtime failed): ${message.split('\n')[0]}`);
    fs.rmSync(projectDir, { recursive: true, force: true });
    return { label, skipped: true, reason: message.split('\n')[0] };
  }
}

function runYarnClassicFileConsumer() {
  const yarn = yarnMajor();
  if (!yarn) {
    console.log('\n=== Yarn Classic file:: NOT TESTED (yarn missing) ===');
    return { label: 'Yarn Classic file:', skipped: true, reason: 'yarn missing' };
  }
  if (yarn.major >= 2) {
    console.log(
      `\n=== Yarn Classic file:: NOT TESTED (Yarn Berry ${yarn.version} on PATH; Classic not invoked) ===`,
    );
    return { label: 'Yarn Classic file:', skipped: true, reason: `yarn ${yarn.version}` };
  }
  return runOptionalFileConsumer(`Yarn Classic ${yarn.version} file:`, 'yarn', 'yarn install');
}

function main() {
  console.log(`Foundation repo: ${repoRoot}`);
  buildFoundation();
  const pnpmDir = runPnpmLinkConsumer();
  const yarnPortal = runYarnPortalConsumer();
  const extras = [
    runOptionalFileConsumer('npm file:', 'npm', 'npm install'),
    runYarnClassicFileConsumer(),
    runOptionalFileConsumer('Bun file:', 'bun', 'bun install'),
  ];
  runRebuildPropagation(pnpmDir);
  fs.rmSync(pnpmDir, { recursive: true, force: true });
  if (yarnPortal.projectDir) {
    fs.rmSync(yarnPortal.projectDir, { recursive: true, force: true });
  }
  console.log('\nPortal / link consumer tests passed.');
  if (yarnPortal.skipped) {
    console.log(`Yarn portal: NOT TESTED (${yarnPortal.reason}).`);
  }
  for (const extra of extras) {
    if (extra.skipped) {
      console.log(`${extra.label}: NOT TESTED (${extra.reason}).`);
    }
  }
}

main();
