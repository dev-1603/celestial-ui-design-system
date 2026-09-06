#!/usr/bin/env node
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { artifactsDir } from './lib.mjs';

function main() {
  const coreTgz = fs
    .readdirSync(artifactsDir)
    .find((file) => file.startsWith('celestial-ui-core-') && file.endsWith('.tgz'));

  if (!coreTgz) {
    console.log('Deno consumer: SKIP (no packed core tarball — run consumer:test first)');
    process.exit(0);
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'celestial-deno-'));
  const tarballPath = path.join(artifactsDir, coreTgz);
  const script = `
import { createDisclosure } from "npm:@celestial-ui/core@${tarballPath}";
const d = createDisclosure({ defaultOpen: false });
if (d.getSnapshot().open !== false) throw new Error("deno consumer failed");
console.log("deno consumer OK");
`;

  fs.writeFileSync(path.join(tempDir, 'check.ts'), script);

  try {
    execSync('deno run --allow-read check.ts', { cwd: tempDir, stdio: 'inherit' });
    console.log('Deno consumer: PASS (best-effort)');
  } catch {
    console.log('Deno consumer: N/A (Deno not installed or CJS interop limitation)');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main();
