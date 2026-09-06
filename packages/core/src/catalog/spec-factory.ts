import type { ComponentId } from '../ids';
import { assertComponentId } from '../ids';
import type { ComponentSpec } from '../spec/spec';
import { defineComponentSpec } from '../spec/spec';
import type { ComponentCapability } from '../capabilities/types';
import type { ComponentContract } from '../contracts/types';
import inventoryData from './data/generic-component-inventory.json';
import type { SpecProfileKey } from './spec-profiles';
import { SPEC_PROFILES } from './spec-profiles';
import type {
  ComponentMetadataStatus,
  ComponentTaxonomy,
  EngineeringFamily,
} from './types';

export interface GenericInventoryEntry {
  readonly id: string;
  readonly displayName: string;
  readonly purpose: string;
  readonly taxonomy: ComponentTaxonomy;
  readonly engineeringFamily: EngineeringFamily;
  readonly complexity: 'simple' | 'moderate' | 'complex';
  readonly status: ComponentMetadataStatus;
  readonly profile: SpecProfileKey;
  readonly referenceSpec?: boolean;
}

export interface GenericComponentInventory {
  readonly schemaVersion: string;
  readonly expectedCount: number;
  readonly updatedAt: string;
  readonly entries: readonly GenericInventoryEntry[];
}

export const GENERIC_COMPONENT_INVENTORY = inventoryData as GenericComponentInventory;

export const GENERIC_COMPONENT_IDS: readonly ComponentId[] = GENERIC_COMPONENT_INVENTORY.entries.map(
  (entry) => assertComponentId(entry.id),
);

export const REFERENCE_COMPONENT_IDS: readonly ComponentId[] = GENERIC_COMPONENT_INVENTORY.entries
  .filter((entry) => entry.referenceSpec)
  .map((entry) => assertComponentId(entry.id));

export type ReferenceComponentId =
  | 'button'
  | 'input'
  | 'checkbox'
  | 'select'
  | 'dialog'
  | 'table';

export function getInventoryEntry(id: string): GenericInventoryEntry | undefined {
  return GENERIC_COMPONENT_INVENTORY.entries.find((entry) => entry.id === id);
}

export function buildComponentSpecFromInventory(entry: GenericInventoryEntry): ComponentSpec {
  const profile = SPEC_PROFILES[entry.profile];
  if (!profile) {
    throw new Error(`Unknown spec profile "${entry.profile}" for component "${entry.id}"`);
  }

  const partial = profile.buildContract(entry.id);
  const contract = {
    ...partial,
    id: assertComponentId(entry.id),
  } as ComponentContract;

  const capabilities: readonly ComponentCapability[] = profile.capabilities;

  return defineComponentSpec({
    contract,
    metadata: {
      displayName: entry.displayName,
      purpose: entry.purpose,
      status: entry.status,
      taxonomy: entry.taxonomy,
      engineeringFamily: entry.engineeringFamily,
      complexity: entry.complexity,
      capabilities,
    },
    environment: { ssr: true, browser: true },
  });
}
