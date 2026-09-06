#!/usr/bin/env node
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fixturesDir, packAll, run, writeTarballDependencies } from './lib.mjs';

const MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'];

function installTarballs(projectDir, packageNames, tarballs, manager) {
  writeTarballDependencies(projectDir, packageNames, tarballs);

  if (manager === 'pnpm') {
    run('pnpm install', projectDir);
  } else if (manager === 'npm') {
    run('npm install', projectDir);
  } else if (manager === 'yarn') {
    run('yarn install', projectDir);
  } else {
    run('bun install', projectDir);
  }
}

function runCheck(projectDir, manager) {
  if (manager === 'bun') {
    run('bun check.ts', projectDir);
    return;
  }
  run('node --import tsx check.ts', projectDir);
}

function runCjsSmoke(projectDir, packageNames, manager) {
  if (manager !== 'bun') {
    return;
  }
  const requires = packageNames
    .map(
      (name, i) =>
        `const m${i} = require(${JSON.stringify(name)});
if (!m${i}) throw new Error(${JSON.stringify(`CJS require(${name}) returned empty`)});`,
    )
    .join('\n');
  fs.writeFileSync(
    path.join(projectDir, '_cjs-smoke.cjs'),
    `'use strict';
${requires}
console.log('cjs smoke OK');
`,
  );
  run('bun _cjs-smoke.cjs', projectDir);
}

function runFixture(fixtureName, packageNames, tarballs, manager) {
  const sourceDir = path.join(fixturesDir, fixtureName);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `celestial-consumer-${fixtureName}-`));
  fs.cpSync(sourceDir, tempDir, { recursive: true });

  console.log(`\n=== Consumer test: ${fixtureName} (${manager}) ===`);
  installTarballs(tempDir, packageNames, tarballs, manager);
  runCheck(tempDir, manager);
  runCjsSmoke(tempDir, packageNames, manager);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

function main() {
  const manager = process.argv[2] ?? 'pnpm';
  if (!MANAGERS.includes(manager)) {
    throw new Error(`Unsupported package manager: ${manager}`);
  }
  if (manager === 'bun') {
    try {
      run('bun --version', process.cwd());
    } catch {
      throw new Error('Bun is not installed. Install Bun to run consumer:test:bun.');
    }
  }

  const tarballs = packAll();

  runFixture(
    'foundation-node',
    ['@celestial-ui/tokens', '@celestial-ui/theme', '@celestial-ui/styles'],
    tarballs,
    manager,
  );
  runFixture('core-node', ['@celestial-ui/core'], tarballs, manager);
  runFixture('icons-node', ['@celestial-ui/icons'], tarballs, manager);
  runFixture(
    'ssr-node',
    ['@celestial-ui/core', '@celestial-ui/styles', '@celestial-ui/theme', '@celestial-ui/tokens'],
    tarballs,
    manager,
  );

  console.log('\nAll consumer tests passed.');
}

main();
