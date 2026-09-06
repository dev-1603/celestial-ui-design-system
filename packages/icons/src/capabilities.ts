/**
 * Provider capability model.
 *
 * Evaluates whether a provider can satisfy a variant request.
 * Kept separate from the resolver so it can be tested in isolation
 * and reused across the resolver and fallback chain.
 */
import type { IconProviderAdapter, IconVariantRequest } from './types';

/**
 * Returns `true` if the given adapter can satisfy the requested variant.
 *
 * Delegates to the adapter's `canSatisfyVariant` method, but also
 * applies basic capability-level checks so the resolver does not need
 * to repeat them.
 *
 * A request with no variant specified is always satisfiable by any adapter.
 */
export function canProviderSatisfyVariant(
  adapter: IconProviderAdapter,
  variant: Readonly<IconVariantRequest> | undefined,
): boolean {
  if (!variant) return true;

  // Check style capability
  if (variant.style !== undefined) {
    if (
      adapter.capabilities.styles.length > 0 &&
      !adapter.capabilities.styles.includes(variant.style)
    ) {
      return false;
    }
  }

  // Check color mode capability
  if (variant.colorMode !== undefined) {
    if (
      adapter.capabilities.colorModes.length > 0 &&
      !adapter.capabilities.colorModes.includes(variant.colorMode)
    ) {
      return false;
    }
  }

  if (variant.weight !== undefined) {
    if (
      adapter.capabilities.weights.length > 0 &&
      !adapter.capabilities.weights.includes(variant.weight)
    ) {
      return false;
    }
  }

  // Delegate remaining checks to the adapter (size, provider-specific rules)
  return adapter.canSatisfyVariant(variant);
}

/**
 * Returns a human-readable reason why the adapter cannot satisfy the variant.
 * Used for diagnostic output only — not part of the resolution path.
 */
export function describeCapabilityMismatch(
  adapter: IconProviderAdapter,
  variant: Readonly<IconVariantRequest>,
): string {
  const reasons: string[] = [];

  if (
    variant.style !== undefined &&
    adapter.capabilities.styles.length > 0 &&
    !adapter.capabilities.styles.includes(variant.style)
  ) {
    reasons.push(
      `style '${variant.style}' not supported (available: ${adapter.capabilities.styles.join(', ')})`,
    );
  }

  if (
    variant.colorMode !== undefined &&
    adapter.capabilities.colorModes.length > 0 &&
    !adapter.capabilities.colorModes.includes(variant.colorMode)
  ) {
    reasons.push(
      `colorMode '${variant.colorMode}' not supported (available: ${adapter.capabilities.colorModes.join(', ')})`,
    );
  }

  if (
    variant.weight !== undefined &&
    adapter.capabilities.weights.length > 0 &&
    !adapter.capabilities.weights.includes(variant.weight)
  ) {
    reasons.push(
      `weight '${variant.weight}' not supported (available: ${adapter.capabilities.weights.join(', ')})`,
    );
  }

  return reasons.length > 0
    ? `Provider '${adapter.id}': ${reasons.join('; ')}`
    : `Provider '${adapter.id}': adapter.canSatisfyVariant returned false`;
}
