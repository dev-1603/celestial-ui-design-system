import type { ComponentId } from '../ids';
import { assertComponentId } from '../ids';
import inventoryData from './data/generic-component-inventory.json';
import type { SpecProfileKey } from './spec-profiles';
import type { ComponentMetadataStatus, ComponentTaxonomy, EngineeringFamily } from './types';

export { buildComponentSpecFromInventory } from './spec-build';

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

export const GENERIC_COMPONENT_IDS: readonly ComponentId[] =
  GENERIC_COMPONENT_INVENTORY.entries.map((entry) => assertComponentId(entry.id));

export const REFERENCE_COMPONENT_IDS: readonly ComponentId[] = GENERIC_COMPONENT_INVENTORY.entries
  .filter((entry) => entry.referenceSpec)
  .map((entry) => assertComponentId(entry.id));

export type ReferenceComponentId =
  | 'button'
  | 'input'
  | 'checkbox'
  | 'select'
  | 'dialog'
  | 'table'
  | 'label'
  | 'switch'
  | 'radio-group';

export function getInventoryEntry(id: string): GenericInventoryEntry | undefined {
  return GENERIC_COMPONENT_INVENTORY.entries.find((entry) => entry.id === id);
}
