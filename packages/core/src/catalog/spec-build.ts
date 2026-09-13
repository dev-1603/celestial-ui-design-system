import type { ComponentCapability } from '../capabilities/types';
import type { ComponentContract } from '../contracts/types';
import type { ComponentSpec } from '../spec/spec';
import { defineComponentSpec } from '../spec/spec';
import { assertComponentId } from '../ids';
import type { GenericInventoryEntry } from './spec-factory';
import { SPEC_PROFILES } from './spec-profiles';

/**
 * Build a generated ComponentSpec from a single inventory entry.
 *
 * This module must not import the catalog JSON. Generated `./specs/<id>`
 * files pass their own entry so a leaf like accordion does not embed all 103.
 */
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
