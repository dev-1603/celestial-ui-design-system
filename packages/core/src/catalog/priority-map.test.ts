import { describe, it, expect } from 'vitest';
import { GENERIC_COMPONENT_IDS, REFERENCE_COMPONENT_IDS } from './spec-factory';
import { validatePhase1PriorityMap, listPhase1RequiredEntries } from './validate-priority-map';
import { getPhase1Priority, listIdsByPriority } from './priority-map';
import { CANONICAL_CATALOG } from './registry';
import { getComponentSpec } from './specs/registry';

describe('phase 1 priority map', () => {
  it('passes validation (36 P0 / 46 P1 / 16 P2 / 5 P3)', () => {
    const report = validatePhase1PriorityMap();
    expect(report.passed, report.issues.map((i) => i.message).join('\n')).toBe(true);
  });

  it('covers every catalog id exactly once', () => {
    const required = listPhase1RequiredEntries();
    expect(required).toHaveLength(82);
    expect(listIdsByPriority('P0')).toHaveLength(36);
    expect(listIdsByPriority('P1')).toHaveLength(46);
    for (const id of GENERIC_COMPONENT_IDS) {
      expect(getPhase1Priority(id)).toBeDefined();
    }
  });

  it('derives reference catalog capabilities from hand-authored specs', () => {
    for (const id of REFERENCE_COMPONENT_IDS) {
      const catalog = CANONICAL_CATALOG.find((e) => e.id === id);
      const spec = getComponentSpec(id);
      expect(catalog?.capabilities).toEqual(spec.metadata.capabilities);
    }
  });
});
