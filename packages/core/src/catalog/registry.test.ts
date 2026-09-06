import { describe, it, expect } from 'vitest';
import {
  CANONICAL_CATALOG,
  getCatalogEntry,
  listCatalogEntries,
  isCatalogComponentId,
  REFERENCE_COMPONENT_IDS,
  GENERIC_COMPONENT_IDS,
} from './registry';
import { GENERIC_COMPONENT_INVENTORY } from './spec-factory';
import { validateAllComponentSpecs, validateGenericInventory } from './validate-inventory';

describe('canonical component catalog', () => {
  it('lists all 103 generic components', () => {
    expect(GENERIC_COMPONENT_INVENTORY.expectedCount).toBe(103);
    expect(CANONICAL_CATALOG.length).toBe(103);
    expect(GENERIC_COMPONENT_IDS.length).toBe(103);
  });

  it('includes six reference components', () => {
    expect(REFERENCE_COMPONENT_IDS.length).toBe(6);
    expect(REFERENCE_COMPONENT_IDS).toEqual(
      expect.arrayContaining(['button', 'input', 'checkbox', 'select', 'dialog', 'table']),
    );
  });

  it('has unique component IDs', () => {
    const ids = listCatalogEntries().map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('resolves catalog entries by id', () => {
    const button = getCatalogEntry('button');
    expect(button?.engineeringFamily).toBe('primitives');
    expect(isCatalogComponentId('button')).toBe(true);
    expect(isCatalogComponentId('not-a-component')).toBe(false);
  });

  it('passes inventory metadata validation', () => {
    const report = validateGenericInventory();
    expect(report.passed, report.issues.map((i) => i.message).join('\n')).toBe(true);
  });

  it('validates all 103 component specs', () => {
    const report = validateAllComponentSpecs();
    expect(report.passed, report.issues.map((i) => i.message).join('\n')).toBe(true);
  });
});
