import { validateComponentSpec, type ComponentSpec } from '../spec/spec';
import { createConformanceHarness } from '../conformance/harness';
import {
  GENERIC_COMPONENT_INVENTORY,
  GENERIC_COMPONENT_IDS,
  type GenericInventoryEntry,
} from './spec-factory';
import { listComponentSpecs } from './specs/registry';
import { COMPONENT_TAXONOMIES, ENGINEERING_FAMILIES } from './types';
import { ALL_COMPONENT_CAPABILITIES } from '../capabilities/types';
import { CANONICAL_CATALOG } from './registry';

export interface InventoryValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly componentId?: string;
}

export interface InventoryValidationReport {
  readonly passed: boolean;
  readonly issues: readonly InventoryValidationIssue[];
}

const FRAMEWORK_LEAK_PATTERNS = [
  /\bReact\b/,
  /\bVue\b/,
  /\bSvelte\b/,
  /\bAngular\b/,
  /\bJSX\b/,
  /React\./,
  /useState/,
  /useEffect/,
];

function issue(code: string, message: string, componentId?: string): InventoryValidationIssue {
  return { code, message, componentId };
}

function validateInventoryEntry(entry: GenericInventoryEntry): InventoryValidationIssue[] {
  const issues: InventoryValidationIssue[] = [];

  if (!COMPONENT_TAXONOMIES.includes(entry.taxonomy)) {
    issues.push(issue('INVALID_TAXONOMY', `Invalid taxonomy "${entry.taxonomy}"`, entry.id));
  }
  if (!ENGINEERING_FAMILIES.includes(entry.engineeringFamily)) {
    issues.push(
      issue('INVALID_FAMILY', `Invalid engineering family "${entry.engineeringFamily}"`, entry.id),
    );
  }

  return issues;
}

function validateInventoryUniqueness(
  entries: readonly GenericInventoryEntry[],
  issues: InventoryValidationIssue[],
): Set<string> {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.id)) {
      issues.push(issue('DUPLICATE_ID', `Duplicate component id "${entry.id}"`, entry.id));
    }
    seen.add(entry.id);
    issues.push(...validateInventoryEntry(entry));
  }
  return seen;
}

function validateCatalogAlignment(
  seen: Set<string>,
  entryCount: number,
  issues: InventoryValidationIssue[],
): void {
  if (CANONICAL_CATALOG.length !== entryCount) {
    issues.push(
      issue(
        'CATALOG_COUNT_MISMATCH',
        `Catalog has ${CANONICAL_CATALOG.length} entries, inventory has ${entryCount}`,
      ),
    );
  }
  for (const catalogEntry of CANONICAL_CATALOG) {
    if (!seen.has(catalogEntry.id)) {
      issues.push(
        issue('CATALOG_MISSING_ID', `Catalog entry missing from inventory`, catalogEntry.id),
      );
    }
    for (const capability of catalogEntry.capabilities) {
      if (!ALL_COMPONENT_CAPABILITIES.includes(capability)) {
        issues.push(
          issue('INVALID_CAPABILITY', `Invalid capability "${capability}"`, catalogEntry.id),
        );
      }
    }
  }
}

function validateExpectedInventoryIds(seen: Set<string>, issues: InventoryValidationIssue[]): void {
  for (const id of GENERIC_COMPONENT_IDS) {
    if (!seen.has(id)) {
      issues.push(issue('MISSING_INVENTORY_ID', `Inventory missing expected id "${id}"`, id));
    }
  }
}

export function validateGenericInventory(): InventoryValidationReport {
  const issues: InventoryValidationIssue[] = [];
  const expected = GENERIC_COMPONENT_INVENTORY.expectedCount;
  const entries = GENERIC_COMPONENT_INVENTORY.entries;

  if (entries.length !== expected) {
    issues.push(
      issue(
        'INVENTORY_COUNT_MISMATCH',
        `Expected ${expected} generic components, found ${entries.length}`,
      ),
    );
  }

  const seen = validateInventoryUniqueness(entries, issues);
  validateCatalogAlignment(seen, entries.length, issues);
  validateExpectedInventoryIds(seen, issues);

  return { passed: issues.length === 0, issues };
}

function validateSpecConformance(spec: ComponentSpec, issues: InventoryValidationIssue[]): void {
  const validation = validateComponentSpec(spec);
  if (!validation.isValid) {
    for (const error of validation.errors) {
      issues.push(issue('INVALID_SPEC', error.reason, spec.contract.id));
    }
  }

  const harness = createConformanceHarness(spec);
  const specReport = harness.validateSpec();
  const capReport = harness.validateCapabilities();
  for (const failure of [...specReport.failures, ...capReport.failures]) {
    issues.push(issue('CONFORMANCE_FAILED', failure.message, spec.contract.id));
  }
}

function validateFrameworkLeak(spec: ComponentSpec, issues: InventoryValidationIssue[]): void {
  const serialized = JSON.stringify(spec);
  for (const pattern of FRAMEWORK_LEAK_PATTERNS) {
    if (pattern.test(serialized)) {
      issues.push(
        issue(
          'FRAMEWORK_LEAK',
          `Framework-specific reference matched ${pattern}`,
          spec.contract.id,
        ),
      );
    }
  }
}

function validateLoadedSpecs(issues: InventoryValidationIssue[]): void {
  const specs = listComponentSpecs();

  if (specs.length !== GENERIC_COMPONENT_INVENTORY.expectedCount) {
    issues.push(
      issue(
        'SPEC_COUNT_MISMATCH',
        `Expected ${GENERIC_COMPONENT_INVENTORY.expectedCount} specs, loaded ${specs.length}`,
      ),
    );
  }

  for (const spec of specs) {
    validateSpecConformance(spec, issues);
    validateFrameworkLeak(spec, issues);
  }
}

export function validateAllComponentSpecs(): InventoryValidationReport {
  const inventoryReport = validateGenericInventory();
  const issues: InventoryValidationIssue[] = [...inventoryReport.issues];
  validateLoadedSpecs(issues);
  return { passed: issues.length === 0, issues };
}

export function assertGenericInventoryValid(): void {
  const report = validateAllComponentSpecs();
  if (!report.passed) {
    const summary = report.issues.map((i) => `${i.code}: ${i.message}`).join('\n');
    throw new Error(`Generic component inventory validation failed:\n${summary}`);
  }
}

export type { CatalogEntry, ComponentTaxonomy, EngineeringFamily } from './types';
