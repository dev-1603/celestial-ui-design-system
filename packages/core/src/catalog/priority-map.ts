import type { ComponentId } from '../ids';
import { assertComponentId } from '../ids';
import priorityData from './data/phase1-component-priority-map.json';

export type Phase1Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface Phase1PriorityEntry {
  readonly id: ComponentId;
  readonly displayName: string;
  readonly priority: Phase1Priority;
  readonly phase: number;
  readonly contractReadinessRequired: boolean;
  readonly rationale: string;
  readonly status: 'IN_PROGRESS' | 'READY' | 'DEFERRED';
}

export interface Phase1PriorityMap {
  readonly schemaVersion: string;
  readonly expectedCount: number;
  readonly counts: Readonly<Record<Phase1Priority, number>>;
  readonly updatedAt: string;
  readonly entries: readonly Phase1PriorityEntry[];
}

export const PHASE1_PRIORITY_MAP = priorityData as unknown as Phase1PriorityMap;

const priorityById = new Map<ComponentId, Phase1PriorityEntry>(
  PHASE1_PRIORITY_MAP.entries.map((entry) => [assertComponentId(entry.id), entry]),
);

export function getPhase1PriorityEntry(id: string): Phase1PriorityEntry | undefined {
  return priorityById.get(id as ComponentId);
}

export function getPhase1Priority(id: string): Phase1Priority | undefined {
  return priorityById.get(id as ComponentId)?.priority;
}

export function isPhase1ContractRequired(id: string): boolean {
  return priorityById.get(id as ComponentId)?.contractReadinessRequired ?? false;
}

export function listPhase1PriorityEntries(): readonly Phase1PriorityEntry[] {
  return PHASE1_PRIORITY_MAP.entries;
}

export function listIdsByPriority(priority: Phase1Priority): readonly ComponentId[] {
  return PHASE1_PRIORITY_MAP.entries
    .filter((entry) => entry.priority === priority)
    .map((entry) => assertComponentId(entry.id));
}
