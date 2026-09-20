#!/usr/bin/env node
/**
 * Generates docs/contracts/<id>.md for Phase 1 P0/P1 components.
 * Run: node tooling/generate-contract-docs.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'docs/contracts');

async function load() {
  const { listComponentSpecs } = await import(
    join(root, 'packages/core/dist/cjs/catalog/specs/registry.js')
  );
  const { listPhase1RequiredEntries } = await import(
    join(root, 'packages/core/dist/cjs/catalog/validate-priority-map.js')
  );
  return { specs: listComponentSpecs(), phase1: listPhase1RequiredEntries() };
}

function renderSpecSection(spec) {
  const c = spec.contract;
  return [
    '## Machine-derived (from ComponentSpec)',
    '',
    '```json',
    JSON.stringify(
      {
        id: c.id,
        version: c.version,
        schemaVersion: c.schemaVersion,
        props: c.props,
        variants: c.variants,
        sizes: c.sizes,
        states: c.states,
        events: c.events,
        parts: c.parts,
        slots: c.slots,
        accessibility: c.accessibility,
        keyboard: c.keyboard,
        focus: c.focus,
        controlled: c.controlled,
        composition: c.composition,
        formField: c.formField,
        polymorphism: c.polymorphism,
        behavior: c.behavior,
        extensions: c.extensions,
      },
      null,
      2,
    ),
    '```',
    '',
  ].join('\n');
}

function renderNarrative(spec, priority) {
  const m = spec.metadata;
  return [
    '## Purpose',
    '',
    m.purpose ?? m.description ?? '_See ComponentSpec metadata._',
    '',
    '## Scope',
    '',
    `Phase 1 (${priority}) contract for \`${spec.contract.id}\`. Framework-agnostic semantics only; rendering belongs to adapters.`,
    '',
    '## Non-goals',
    '',
    '- Visual styling (tokens/theme/styles packages)',
    '- Framework-specific APIs (`asChild`, hooks, JSX)',
    '',
    '## Keyboard interaction',
    '',
    cKeyboard(spec),
    '',
    '## Focus behavior',
    '',
    spec.contract.focus
      ? 'Focus contract declared in ComponentSpec; adapters must preserve trap/restore/roving semantics.'
      : 'No special focus contract beyond native element behavior.',
    '',
    '## Framework adapter notes',
    '',
    'Consume this ComponentSpec via `@celestial-ui/core/specs/' + spec.contract.id + '`. Do not redefine behavior in React/Vue.',
    '',
    '## Contract status',
    '',
    spec.contract.extensions?.phase1Readiness === 'ready' ? '**PHASE-1 READY**' : 'IN_PROGRESS',
    '',
  ].join('\n');
}

function cKeyboard(spec) {
  const bindings = spec.contract.keyboard?.bindings ?? [];
  if (!bindings.length) return 'No keyboard bindings declared.';
  return bindings.map((b) => `- \`${b.keys.join(', ')}\` → \`${b.intent}\``).join('\n');
}

try {
  const { specs, phase1 } = await load();
  const phase1Ids = new Set(phase1.map((e) => e.id));
  mkdirSync(outDir, { recursive: true });

  let count = 0;
  for (const spec of specs) {
    if (!phase1Ids.has(spec.contract.id)) continue;
    const entry = phase1.find((e) => e.id === spec.contract.id);
    const content = [
      `# ${spec.metadata.displayName}`,
      '',
      `> Generated mechanical sections from ComponentSpec. Narrative sections are Phase 1 contract documentation.`,
      '',
      renderNarrative(spec, entry?.priority ?? 'P0'),
      renderSpecSection(spec),
    ].join('\n');
    writeFileSync(join(outDir, `${spec.contract.id}.md`), content);
    count += 1;
  }

  writeFileSync(
    join(outDir, 'README.md'),
    `# Component contract documentation\n\nPer-component Phase 1 contract docs for P0/P1 (${count} files).\n\n- **Authority:** \`ComponentSpec\` in \`@celestial-ui/core\`\n- **Regenerate:** \`pnpm build && node tooling/generate-contract-docs.mjs\`\n`,
  );
  console.log(`Wrote ${count} contract docs to ${outDir}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
