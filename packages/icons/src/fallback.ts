/**
 * Fallback chain evaluator.
 *
 * Given an ordered list of fallback provider IDs, evaluates each in sequence
 * until one can satisfy the request. Returns the first successful resolution
 * or `null` if all fallbacks are exhausted.
 *
 * Called by the resolver only after the primary provider has failed.
 */
import type { IconRequest, IconConfig, IconResolution } from './types';
import type { IconProviderRegistry } from './provider-registry';
import { tryProvider } from './try-provider';

export interface FallbackResult {
  resolution: IconResolution;
  usedProviderId: string;
}

/**
 * Try each fallback provider in order. Returns the first successful resolution
 * or `null` if all fallbacks are exhausted.
 */
export function evaluateFallbackChain(
  request: Readonly<IconRequest>,
  canonicalName: string,
  fallbackProviderIds: readonly string[],
  registry: IconProviderRegistry,
  config: Readonly<IconConfig>,
  triedProviders: string[],
): FallbackResult | null {
  for (const providerId of fallbackProviderIds) {
    const hit = tryProvider(request, canonicalName, providerId, registry, config, triedProviders);
    if (!hit) continue;

    const resolution: IconResolution = {
      request,
      canonicalName,
      resolvedProviderId: hit.providerId,
      nativeName: hit.nativeName,
      fallbackOccurred: true,
      payload: hit.payload,
      status: 'resolved-via-fallback',
      diagnostics: config.diagnostics
        ? {
            triedProviders: [...triedProviders],
            reason: `Primary failed; resolved via fallback '${hit.providerId}'.`,
          }
        : undefined,
    };

    return { resolution, usedProviderId: hit.providerId };
  }

  return null;
}
