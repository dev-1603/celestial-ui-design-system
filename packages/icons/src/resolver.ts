/**
 * Authoritative icon resolution algorithm.
 *
 * This is the SINGLE implementation of icon resolution in the monorepo.
 * Framework adapters call this function. They must NOT duplicate this logic.
 *
 * Resolution algorithm (step-by-step):
 *   1. Validate the request.
 *   2. Resolve the canonical name (handle aliases).
 *   3. Determine provider order (explicit override vs. config-driven).
 *   4. For each provider: check registration, native name, capability, payload.
 *   5. If primary fails and fallback is configured: evaluate fallback chain.
 *   6. Apply missingIconPolicy when no provider can satisfy.
 *
 * INVARIANTS:
 * - No DOM access. Safe in Node.js (SSR) environments.
 * - Deterministic: same inputs → same output.
 * - Single entry point: `resolveIcon()`.
 */
import type {
  IconRequest,
  IconConfig,
  IconResolution,
  CanonicalIconName,
  ProviderId,
} from './types';
import type { IconProviderRegistry } from './provider-registry';
import type { CanonicalRegistry } from './canonical-registry';
import { IconResolutionError, iconError } from './errors';
import { evaluateFallbackChain } from './fallback';
import { getIconConfig } from './config';
import { canonicalRegistry as defaultCanonicalRegistry } from './canonical-registry';
import { defaultIconProviderRegistry } from './provider-registry';
import { tryProvider } from './try-provider';
import { isValidIconName, isValidProviderId } from './ids';

// ─── Validation ───────────────────────────────────────────────────────────────

function validateRequest(request: Readonly<IconRequest>): void {
  if (!request.name || typeof request.name !== 'string') {
    throw new IconResolutionError(
      'Icon name must be a non-empty string.',
      iconError('INVALID_ICON_NAME', 'Icon name must be a non-empty string.', { layer: 'request' }),
    );
  }
  if (!isValidIconName(request.name)) {
    throw new IconResolutionError(
      `Invalid icon name '${request.name}'.`,
      iconError(
        'INVALID_ICON_NAME',
        `Icon name '${request.name}' is invalid. Names must be lowercase alphanumeric with hyphens, starting with a letter.`,
        { layer: 'request', iconName: request.name },
      ),
    );
  }
  if (request.provider !== undefined && !isValidProviderId(request.provider)) {
    throw new IconResolutionError(
      `Invalid explicit provider id '${request.provider}'.`,
      iconError('INVALID_PROVIDER_ID', `Provider id '${request.provider}' is invalid.`, {
        layer: 'request',
        providerId: request.provider,
      }),
    );
  }
}

// ─── Missing Policy ───────────────────────────────────────────────────────────

function applyMissingPolicy(
  request: Readonly<IconRequest>,
  canonicalName: CanonicalIconName,
  config: Readonly<IconConfig>,
  diagnosticReason: string,
  triedProviders: readonly ProviderId[],
  registry: IconProviderRegistry,
  cRegistry: CanonicalRegistry,
): IconResolution {
  const policy = config.missingIconPolicy ?? { kind: 'empty' };

  if (policy.kind === 'error') {
    throw new IconResolutionError(
      `Icon '${canonicalName}' could not be resolved. ${diagnosticReason}`,
      iconError('ALL_PROVIDERS_FAILED', diagnosticReason, {
        layer: 'provider',
        iconName: canonicalName,
      }),
    );
  }

  if (policy.kind === 'fallback-icon') {
    // Guard against infinite recursion — fallback icon must differ from the failed one
    if (policy.canonicalName === canonicalName || policy.canonicalName === request.name) {
      return {
        request,
        canonicalName,
        resolvedProviderId: null,
        nativeName: null,
        fallbackOccurred: false,
        payload: null,
        status: 'missing',
        diagnostics: {
          triedProviders,
          reason: `Fallback icon '${policy.canonicalName}' is the same as the failed icon; returning empty.`,
        },
      };
    }
    // Recursive call with fallback icon name — depth is bounded by the guard above
    return resolveIcon({ name: policy.canonicalName }, config, registry, cRegistry);
  }

  // Default: kind === 'empty'
  return {
    request,
    canonicalName,
    resolvedProviderId: null,
    nativeName: null,
    fallbackOccurred: false,
    payload: null,
    status: 'missing',
    diagnostics: { triedProviders, reason: diagnosticReason },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ResolveIconOptions {
  /** Override the provider registry (useful in tests and per-request SSR). */
  registry?: IconProviderRegistry;
  /** Override the canonical icon registry (useful in tests). */
  canonicalRegistry?: CanonicalRegistry;
}

function isProviderRegistry(value: unknown): value is IconProviderRegistry {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as IconProviderRegistry).register === 'function' &&
    typeof (value as IconProviderRegistry).has === 'function' &&
    typeof (value as IconProviderRegistry).get === 'function'
  );
}

/**
 * Resolve an icon request to a normalized payload.
 *
 * Pass `IconConfig` as the second argument in SSR so per-request config
 * does not use the process-wide singleton.
 *
 * The third argument may be an `IconProviderRegistry` (existing call sites)
 * or `ResolveIconOptions`.
 */
export function resolveIcon(
  request: Readonly<IconRequest>,
  config: Readonly<IconConfig> = getIconConfig(),
  registryOrOptions: IconProviderRegistry | ResolveIconOptions = defaultIconProviderRegistry,
  cRegistry: CanonicalRegistry = defaultCanonicalRegistry,
): IconResolution {
  const registry = isProviderRegistry(registryOrOptions)
    ? registryOrOptions
    : (registryOrOptions.registry ?? defaultIconProviderRegistry);
  const canonicalReg = isProviderRegistry(registryOrOptions)
    ? cRegistry
    : (registryOrOptions.canonicalRegistry ?? cRegistry);

  validateRequest(request);

  const unknownReason = `'${request.name}' is not a known canonical icon name or alias.`;
  const resolved = canonicalReg.resolve(request.name);
  if (!resolved) {
    return applyMissingPolicy(
      request,
      request.name,
      config,
      unknownReason,
      [],
      registry,
      canonicalReg,
    );
  }
  const canonicalName = resolved;

  const triedProviders: ProviderId[] = [];

  const hasExplicitProvider = request.provider !== undefined;
  const explicitProviderPolicy = config.explicitProviderPolicy ?? 'apply-missing-policy';

  if (hasExplicitProvider) {
    const explicitId = request.provider!;
    const hit = tryProvider(request, canonicalName, explicitId, registry, config, triedProviders);

    if (hit) {
      return {
        request,
        canonicalName,
        resolvedProviderId: hit.providerId,
        nativeName: hit.nativeName,
        fallbackOccurred: false,
        payload: hit.payload,
        status: 'resolved',
        diagnostics: config.diagnostics
          ? { triedProviders, reason: 'Resolved via explicit provider.' }
          : undefined,
      };
    }

    if (explicitProviderPolicy === 'allow-fallback' && config.fallback?.length) {
      const fallbackResult = evaluateFallbackChain(
        request,
        canonicalName,
        config.fallback,
        registry,
        config,
        triedProviders,
      );
      if (fallbackResult) return fallbackResult.resolution;
    }

    return applyMissingPolicy(
      request,
      canonicalName,
      config,
      `Explicit provider '${explicitId}' failed to resolve '${canonicalName}'.`,
      triedProviders,
      registry,
      canonicalReg,
    );
  }

  const primaryId = config.provider;
  const primaryHit = tryProvider(
    request,
    canonicalName,
    primaryId,
    registry,
    config,
    triedProviders,
  );

  if (primaryHit) {
    return {
      request,
      canonicalName,
      resolvedProviderId: primaryHit.providerId,
      nativeName: primaryHit.nativeName,
      fallbackOccurred: false,
      payload: primaryHit.payload,
      status: 'resolved',
      diagnostics: config.diagnostics
        ? { triedProviders, reason: 'Resolved via primary provider.' }
        : undefined,
    };
  }

  if (config.fallback?.length) {
    const fallbackResult = evaluateFallbackChain(
      request,
      canonicalName,
      config.fallback,
      registry,
      config,
      triedProviders,
    );
    if (fallbackResult) return fallbackResult.resolution;
  }

  return applyMissingPolicy(
    request,
    canonicalName,
    config,
    `No provider could resolve '${canonicalName}'. Tried: [${triedProviders.join(', ')}].`,
    triedProviders,
    registry,
    canonicalReg,
  );
}
