import type { ComponentCapability } from './types';
import { CAPABILITY_CONTRACT_KEYS } from './types';

export interface CapabilityValidationFailure {
  readonly capability: ComponentCapability;
  readonly message: string;
}

function contractHasKey(contract: Record<string, unknown>, key: string): boolean {
  const value = contract[key];
  if (value === undefined || value === null) return false;
  if (typeof value === 'object' && Object.keys(value as object).length === 0) return false;
  return true;
}

export function validateCapabilitiesAgainstContract(
  capabilities: readonly ComponentCapability[],
  contract: Record<string, unknown>,
): CapabilityValidationFailure[] {
  const failures: CapabilityValidationFailure[] = [];
  for (const capability of capabilities) {
    const keys = CAPABILITY_CONTRACT_KEYS[capability];
    if (keys.length === 0) continue;
    const satisfied = keys.some((key) => contractHasKey(contract, key));
    if (!satisfied) {
      failures.push({
        capability,
        message: `Capability "${capability}" declared but contract missing: ${keys.join(', ')}`,
      });
    }
  }
  return failures;
}
