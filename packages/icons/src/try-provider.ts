/**
 * Single-provider resolution attempt.
 * Shared by the primary resolver path and the fallback chain.
 */
import type { IconRequest, IconConfig, IconResolution } from './types';
import type { IconProviderRegistry } from './provider-registry';
import { canProviderSatisfyVariant, describeCapabilityMismatch } from './capabilities';

export interface ProviderHit {
  nativeName: string;
  providerId: string;
  payload: NonNullable<IconResolution['payload']>;
}

/**
 * Attempt resolution against a single provider.
 * Returns a hit on success, or `null` if the provider cannot satisfy the request.
 */
export function tryProvider(
  request: Readonly<IconRequest>,
  canonicalName: string,
  providerId: string,
  registry: IconProviderRegistry,
  _config: Readonly<IconConfig>,
  triedProviders: string[],
): ProviderHit | null {
  triedProviders.push(providerId);

  if (!registry.has(providerId)) {
    return null;
  }

  const adapter = registry.get(providerId);

  const nativeName = adapter.resolveNativeName(canonicalName);
  if (!nativeName) return null;

  if (request.variant && !canProviderSatisfyVariant(adapter, request.variant)) {
    describeCapabilityMismatch(adapter, request.variant);
    return null;
  }

  const payload = adapter.resolve(nativeName, request.variant);
  if (!payload) return null;

  return { nativeName, providerId, payload };
}
