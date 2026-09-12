import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { buttonSpec } from './specs/button';
import { inputSpec } from './specs/input';
import { checkboxSpec } from './specs/checkbox';
import { selectSpec } from './specs/select';
import { dialogSpec } from './specs/dialog';
import { tableSpec } from './specs/table';
import { accordionSpec } from './specs/accordion';
import { createConformanceHarness } from '../conformance/harness';
import { REFERENCE_COMPONENT_IDS } from './registry';
import { getComponentSpec, listComponentSpecs } from './specs/registry';
import { GENERIC_COMPONENT_INVENTORY } from './spec-factory';

const referenceSpecs = [buttonSpec, inputSpec, checkboxSpec, selectSpec, dialogSpec, tableSpec];

describe('reference component specs', () => {
  it('covers all reference component ids', () => {
    const ids = referenceSpecs.map((s) => s.contract.id).sort();
    expect(ids).toEqual([...REFERENCE_COMPONENT_IDS].sort());
  });

  it.each(referenceSpecs.map((s) => [s.contract.id, s]))(
    '%s passes conformance harness validation',
    (_id, spec) => {
      const harness = createConformanceHarness(spec);
      harness.assertCompliant();
    },
  );

  it('select declares collection anatomy parts', () => {
    expect(selectSpec.contract.parts?.parts.item).toBeDefined();
    expect(selectSpec.contract.parts?.parts.trigger).toBeDefined();
  });

  it('dialog declares overlay semantics', () => {
    expect(dialogSpec.contract.overlay?.modal).toBe(true);
    expect(dialogSpec.contract.focus?.trap).toBe(true);
  });

  it('button declares size contract', () => {
    expect(buttonSpec.contract.sizes?.sizes).toEqual(['sm', 'md', 'lg']);
  });
});

describe('generated component specs', () => {
  it('loads 103 specs through registry', () => {
    expect(listComponentSpecs().length).toBe(GENERIC_COMPONENT_INVENTORY.expectedCount);
  });

  it('reference specs match hand-authored implementations', () => {
    expect(getComponentSpec('button')).toBe(buttonSpec);
    expect(getComponentSpec('table')).toBe(tableSpec);
  });

  it('generates valid accordion spec', () => {
    const spec = getComponentSpec('accordion');
    expect(spec.contract.id).toBe('accordion');
    expect(spec).toBe(accordionSpec);
    createConformanceHarness(spec).assertCompliant();
  });

  it('generated spec files call the factory path, not the tools hub', () => {
    const specsDir = path.join(__dirname, 'specs');
    const skip = new Set([
      'button.ts',
      'input.ts',
      'checkbox.ts',
      'select.ts',
      'dialog.ts',
      'table.ts',
      'registry.ts',
      '_shared.ts',
      'spec-lookup.ts',
    ]);
    const generated = fs
      .readdirSync(specsDir)
      .filter((name) => name.endsWith('.ts') && !skip.has(name));
    expect(generated).toHaveLength(97);

    for (const name of generated) {
      const source = fs.readFileSync(path.join(specsDir, name), 'utf8');
      expect(source, name).toContain("from './spec-lookup'");
      expect(source, name).not.toContain("from './registry'");
      expect(source, name).not.toContain('generic-component-inventory');
      expect(source, name).toContain('getGeneratedComponentSpec(');
    }
  });
});
