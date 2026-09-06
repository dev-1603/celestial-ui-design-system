import { CONTRACT_SCHEMA_VERSION, SPEC_SCHEMA_VERSION } from '../../version';

export const REFERENCE_SPEC_VERSION = '1.0.0';

export function referenceContractBase(id: string) {
  return {
    id,
    version: REFERENCE_SPEC_VERSION,
    schemaVersion: CONTRACT_SCHEMA_VERSION,
  } as const;
}

export { CONTRACT_SCHEMA_VERSION, SPEC_SCHEMA_VERSION };
