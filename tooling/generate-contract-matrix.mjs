#!/usr/bin/env node
/**
 * Generates docs/component-contract-matrix.md from Core specs + Phase 1 priority map.
 * Run: node tooling/generate-contract-matrix.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const coreDist = join(root, 'packages/core/dist/cjs/catalog/specs/registry.js');

async function loadSpecs() {
  const { listComponentSpecs } = await import(coreDist);
  const { PHASE1_PRIORITY_MAP } = await import(
    join(root, 'packages/core/dist/cjs/catalog/priority-map.js')
  );
  return { specs: listComponentSpecs(), priorityMap: PHASE1_PRIORITY_MAP };
}

function hasSection(contract, key) {
  const value = contract[key];
  if (value === undefined || value === null) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}

function cell(contract, key) {
  return hasSection(contract, key) ? 'YES' : 'N/A';
}

function buildMatrix(specs, priorityMap) {
  const priorityById = new Map(priorityMap.entries.map((e) => [e.id, e.priority]));

  const lines = [
    '# Component Contract Matrix',
    '',
    '**Generated.** Do not edit manually. Run `node tooling/generate-contract-matrix.mjs` after `pnpm build`.',
    '',
    `**Inventory:** ${specs.length} components · **Schema:** ${specs[0]?.contract.schemaVersion ?? '1.1.0'}`,
    '',
    '| Component | ID | Priority | Taxonomy | Family | Props | States | Events | Parts | A11y | Keyboard | Focus | Controlled | Composition | Form | Polymorphism | Phase1 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const spec of specs.sort((a, b) => a.contract.id.localeCompare(b.contract.id))) {
    const c = spec.contract;
    const m = spec.metadata;
    lines.push(
      `| ${m.displayName} | ${c.id} | ${priorityById.get(c.id) ?? '—'} | ${m.taxonomy ?? '—'} | ${m.engineeringFamily ?? '—'} | ${cell(c, 'props')} | ${cell(c, 'states')} | ${cell(c, 'events')} | ${cell(c, 'parts')} | ${cell(c, 'accessibility')} | ${cell(c, 'keyboard')} | ${cell(c, 'focus')} | ${cell(c, 'controlled')} | ${cell(c, 'composition')} | ${cell(c, 'formField')} | ${cell(c, 'polymorphism')} | ${c.extensions?.phase1Readiness === 'ready' ? 'READY' : '—'} |`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

try {
  const { specs, priorityMap } = await loadSpecs();
  const output = buildMatrix(specs, priorityMap);
  const outPath = join(root, 'docs/component-contract-matrix.md');
  writeFileSync(outPath, output);
  console.log(`Wrote ${outPath} (${specs.length} components)`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
