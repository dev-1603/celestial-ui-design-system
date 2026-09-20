import type { ComponentContract } from '../../contracts/types';
import { CONTRACT_SCHEMA_VERSION } from '../../version';
import { applyPhase1Composition, markPhase1Ready } from '../phase1-rules';

export const REFERENCE_SPEC_VERSION = '1.0.0';

export function referenceContractBase(id: string) {
  return {
    id,
    version: REFERENCE_SPEC_VERSION,
    schemaVersion: CONTRACT_SCHEMA_VERSION,
  } as const;
}

/** Apply Phase 1 composition + readiness marker to hand-authored reference contracts. */
export function finalizeReferenceContract(
  contract: Omit<ComponentContract, 'id'> & { id: string },
): ComponentContract {
  const typed = contract as ComponentContract;
  return markPhase1Ready(applyPhase1Composition(typed.id, typed));
}

export { CONTRACT_SCHEMA_VERSION };

export { SPEC_SCHEMA_VERSION } from '../../version';
