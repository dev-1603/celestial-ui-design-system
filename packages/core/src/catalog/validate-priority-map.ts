import { GENERIC_COMPONENT_IDS } from './spec-factory';
import {
  PHASE1_PRIORITY_MAP,
  type Phase1Priority,
  type Phase1PriorityEntry,
} from './priority-map';

export interface PriorityMapValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly componentId?: string;
}

export interface PriorityMapValidationReport {
  readonly passed: boolean;
  readonly issues: readonly PriorityMapValidationIssue[];
}

function issue(code: string, message: string, componentId?: string): PriorityMapValidationIssue {
  return { code, message, componentId };
}

const EXPECTED_COUNTS: Readonly<Record<Phase1Priority, number>> = {
  P0: 36,
  P1: 46,
  P2: 16,
  P3: 5,
};

function validateEntryReadiness(
  entry: Phase1PriorityEntry,
  issues: PriorityMapValidationIssue[],
): void {
  const readinessRequired = entry.priority === 'P0' || entry.priority === 'P1';
  if (entry.contractReadinessRequired !== readinessRequired) {
    issues.push(
      issue(
        'INVALID_READINESS_FLAG',
        `contractReadinessRequired must match P0/P1 for "${entry.id}"`,
        entry.id,
      ),
    );
  }
}

function validateTierCounts(
  counts: Record<Phase1Priority, number>,
  issues: PriorityMapValidationIssue[],
): void {
  for (const [priority, expected] of Object.entries(EXPECTED_COUNTS) as Array<
    [Phase1Priority, number]
  >) {
    const actual = counts[priority];
    if (actual !== expected) {
      issues.push(
        issue(
          'PRIORITY_TIER_COUNT_MISMATCH',
          `Expected ${expected} ${priority} components, found ${actual}`,
        ),
      );
    }
    const declared = PHASE1_PRIORITY_MAP.counts[priority];
    if (declared !== expected) {
      issues.push(
        issue(
          'PRIORITY_METADATA_COUNT_MISMATCH',
          `Priority map metadata declares ${declared} for ${priority}, expected ${expected}`,
        ),
      );
    }
  }
}

function validateCatalogCoverage(
  seen: Set<string>,
  entries: readonly Phase1PriorityEntry[],
  issues: PriorityMapValidationIssue[],
): void {
  for (const id of GENERIC_COMPONENT_IDS) {
    if (!seen.has(id)) {
      issues.push(issue('MISSING_PRIORITY_ID', `Priority map missing catalog id "${id}"`, id));
    }
  }

  for (const entry of entries) {
    if (!GENERIC_COMPONENT_IDS.includes(entry.id)) {
      issues.push(
        issue('UNKNOWN_PRIORITY_ID', `Priority map id "${entry.id}" is not in catalog`, entry.id),
      );
    }
  }
}

export function validatePhase1PriorityMap(): PriorityMapValidationReport {
  const issues: PriorityMapValidationIssue[] = [];
  const entries = PHASE1_PRIORITY_MAP.entries;

  if (entries.length !== PHASE1_PRIORITY_MAP.expectedCount) {
    issues.push(
      issue(
        'PRIORITY_COUNT_MISMATCH',
        `Expected ${PHASE1_PRIORITY_MAP.expectedCount} priority entries, found ${entries.length}`,
      ),
    );
  }

  const seen = new Set<string>();
  const counts: Record<Phase1Priority, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };

  for (const entry of entries) {
    if (seen.has(entry.id)) {
      issues.push(issue('DUPLICATE_PRIORITY_ID', `Duplicate priority id "${entry.id}"`, entry.id));
    }
    seen.add(entry.id);
    counts[entry.priority] += 1;
    validateEntryReadiness(entry, issues);
  }

  validateTierCounts(counts, issues);
  validateCatalogCoverage(seen, entries, issues);

  return { passed: issues.length === 0, issues };
}

export function listPhase1RequiredEntries(): readonly Phase1PriorityEntry[] {
  return PHASE1_PRIORITY_MAP.entries.filter((entry) => entry.contractReadinessRequired);
}
