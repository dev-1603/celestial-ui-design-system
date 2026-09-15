import type { ComponentId } from '../ids';
import { assertComponentId } from '../ids';
import type { CatalogEntry } from './types';
import { CONTRACT_SCHEMA_VERSION, SPEC_SCHEMA_VERSION } from '../version';
import { REFERENCE_SPEC_VERSION } from './specs/_shared';
import { GENERIC_COMPONENT_INVENTORY } from './spec-factory';
import type { ComponentCapability } from '../capabilities/types';
import { SPEC_PROFILES } from './spec-profiles';

/**
 * Lightweight canonical catalog metadata.
 *
 * Does NOT embed full ComponentSpec objects — import specs from
 * `@celestial-ui/core/specs/<id>` subpaths when needed.
 */
export const CANONICAL_CATALOG: readonly CatalogEntry[] = GENERIC_COMPONENT_INVENTORY.entries.map(
  (entry) => ({
    id: assertComponentId(entry.id),
    displayName: entry.displayName,
    purpose: entry.purpose,
    taxonomy: entry.taxonomy,
    engineeringFamily: entry.engineeringFamily,
    status: entry.status,
    specSchemaVersion: SPEC_SCHEMA_VERSION,
    contractSchemaVersion: CONTRACT_SCHEMA_VERSION,
    contractVersion: REFERENCE_SPEC_VERSION,
    capabilities: SPEC_PROFILES[entry.profile].capabilities as readonly ComponentCapability[],
  }),
);

const catalogById = new Map<ComponentId, CatalogEntry>(
  CANONICAL_CATALOG.map((entry) => [entry.id, entry]),
);

export function getCatalogEntry(id: ComponentId): CatalogEntry | undefined {
  return catalogById.get(id);
}

export function listCatalogEntries(): readonly CatalogEntry[] {
  return CANONICAL_CATALOG;
}

export function isCatalogComponentId(id: string): id is ComponentId {
  return catalogById.has(id as ComponentId);
}

export function assertUniqueCatalogIds(): void {
  const seen = new Set<string>();
  for (const entry of CANONICAL_CATALOG) {
    if (seen.has(entry.id)) {
      throw new Error(`Duplicate catalog component id: ${entry.id}`);
    }
    seen.add(entry.id);
  }
}

assertUniqueCatalogIds();

export { GENERIC_COMPONENT_IDS, REFERENCE_COMPONENT_IDS } from './spec-factory';
export type { ReferenceComponentId } from './spec-factory';
