/**
 * @celestial-ui/icons — Core TypeScript Contracts
 *
 * This file defines the stable public-facing types for the icon system.
 * No implementation logic lives here.
 *
 * Naming convention:
 *  - `CanonicalIconName` — a Celestial-owned stable name (e.g. "search")
 *  - `ProviderId`        — a registered provider identifier (e.g. "lucide", "fa")
 *  - `NativeName`        — a provider-native icon name (e.g. "Search", "magnifying-glass")
 */

// ─── Provider Identity ────────────────────────────────────────────────────────

/**
 * Stable Celestial canonical icon name.
 * Never a provider-native name. Owned and versioned by the Celestial team.
 * Example: "search", "calendar", "user"
 */
export type CanonicalIconName = string;

/**
 * Registered provider identifier.
 * Must match the `id` property on the corresponding `IconProviderAdapter`.
 */
export type ProviderId = string;

/** Provider-native icon name (provider-specific naming convention). */
export type NativeName = string;

/**
 * The canonical set of built-in provider IDs shipped with this package.
 * Custom/tenant providers may use any string not in this set.
 */
export type BuiltInProviderId =
  | 'lucide'
  | 'fa'
  | 'material'
  | 'heroicons'
  | 'phosphor'
  | 'iconify';

// ─── Icon Variant ─────────────────────────────────────────────────────────────

/**
 * Visual variant request for an icon.
 * Providers that do not support the requested variant will be skipped
 * during resolution (or fallback will be attempted).
 */
export interface IconVariantRequest {
  /** Visual style / fill type. */
  style?:
    | 'outline'
    | 'outlined'
    | 'rounded'
    | 'sharp'
    | 'solid'
    | 'duotone'
    | 'thin'
    | 'light'
    | 'regular'
    | 'bold'
    | 'fill'
    | 'mini'
    | 'micro';
  /** Stroke/fill weight. Provider-specific granularity. */
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  /** Color complexity supported by the icon. */
  colorMode?: 'monochrome' | 'duotone' | 'multicolor';
  /** Desired render size. Providers may ignore or clamp to their supported sizes. */
  size?: number | string;
}

// ─── Icon Request ─────────────────────────────────────────────────────────────

/**
 * Describes what a caller wants from the icon system.
 *
 * The majority of callers specify only `name`. The `provider` field is an
 * intentional per-icon override — it bypasses the application default and
 * fallback chain. When `provider` is specified, the resolution contract
 * applies stricter failure semantics (see `IconConfig.explicitProviderPolicy`).
 */
export interface IconRequest {
  /** Celestial canonical icon name. */
  name: CanonicalIconName;
  /**
   * Explicit provider override.
   * When set, resolution starts at this provider, not at the application default.
   * Failure semantics are governed by `IconConfig.explicitProviderPolicy`.
   */
  provider?: ProviderId;
  /** Requested visual variant. */
  variant?: IconVariantRequest;
}

// ─── Provider Capabilities ────────────────────────────────────────────────────

/**
 * Describes what an icon provider can deliver.
 * Consumed by the resolver to determine provider suitability.
 */
export interface ProviderCapabilities {
  /** Supported visual styles. */
  readonly styles: readonly string[];
  /** Supported weight values. */
  readonly weights: readonly string[];
  /** Supported color modes. */
  readonly colorModes: readonly ('monochrome' | 'duotone' | 'multicolor')[];
  /** Whether the provider renders at arbitrary sizes. */
  readonly supportsArbitrarySize: boolean;
  /** Whether the provider can resolve icons without DOM access (Node.js / SSR). */
  readonly supportsSSR: boolean;
}

// ─── Normalized Icon Payload ──────────────────────────────────────────────────

/**
 * Discriminated union tag for payload formats.
 *
 * - `svg-string`    Raw SVG markup. Must be sanitized by the framework adapter before DOM injection.
 * - `svg-data`      Structured SVG data (width, height, paths). Framework adapter constructs markup.
 * - `component-ref` Opaque reference to a framework-specific component. Interpreted by the adapter.
 * - `font-class`    One or more CSS class names for a font-based icon.
 * - `url`           Asset URL reference (for CDN-hosted or local SVG assets).
 */
export type IconPayloadKind =
  | 'svg-string'
  | 'svg-data'
  | 'component-ref'
  | 'font-class'
  | 'url';

/**
 * Normalized icon payload returned by a provider adapter.
 * The core resolver treats `data` as opaque — only the framework adapter
 * and the provider that created it understand the `data` shape.
 */
export interface NormalizedIconPayload {
  readonly kind: IconPayloadKind;
  /**
   * Payload data. Shape depends on `kind`:
   * - `svg-string`    → `string`
   * - `svg-data`      → `{ width: number; height: number; body: string }`
   * - `component-ref` → provider-specific reference (e.g. React component)
   * - `font-class`    → `string` (CSS class names, space-separated)
   * - `url`           → `string` (absolute or relative URL)
   */
  readonly data: unknown;
  /** Resolved variant. May differ from the requested variant if the provider coerced it. */
  readonly resolvedVariant?: Readonly<IconVariantRequest>;
  /** Provider-native name of the resolved icon. */
  readonly nativeName: NativeName;
}

// ─── Provider Adapter Contract ────────────────────────────────────────────────

/**
 * The interface every icon provider must implement.
 *
 * INVARIANTS:
 * - `id` must be stable across package versions for a given provider.
 * - `resolveNativeName` must be pure — no side effects, no network I/O.
 * - `resolve` must be safe to call in a Node.js (SSR) environment for
 *   providers that declare `capabilities.supportsSSR: true`.
 * - Providers must NOT call back into the core resolver (no circular calls).
 */
export interface IconProviderAdapter {
  /** Unique, stable provider identifier. Must match a registered `ProviderId`. */
  readonly id: ProviderId;
  /** Human-readable display label. */
  readonly displayName: string;
  /** Version of the underlying icon library (for diagnostics and catalogue generation). */
  readonly version: string;
  /** Catalogue schema version this adapter was built against. */
  readonly catalogueSchemaVersion: string;
  /** What this provider can deliver. */
  readonly capabilities: ProviderCapabilities;

  /**
   * Returns the provider-native icon name for the given Celestial canonical name.
   * Returns `undefined` if the provider does not have this icon.
   */
  resolveNativeName(canonicalName: CanonicalIconName): NativeName | undefined;

  /**
   * Returns `true` if this provider can satisfy the requested variant.
   * Must be a fast, synchronous check (no I/O).
   */
  canSatisfyVariant(variant: Readonly<IconVariantRequest>): boolean;

  /**
   * Resolves the icon to a normalized payload.
   * Returns `undefined` if the icon cannot be loaded (e.g. missing asset).
   * This method is called only after `resolveNativeName` and `canSatisfyVariant`
   * have already confirmed availability — implementations may assert on these.
   */
  resolve(
    nativeName: NativeName,
    variant: Readonly<IconVariantRequest> | undefined,
  ): NormalizedIconPayload | undefined;
}

// ─── Catalogue Types ──────────────────────────────────────────────────────────

/** A single entry in the Celestial canonical icon catalogue. */
export interface CanonicalCatalogueEntry {
  readonly name: CanonicalIconName;
  readonly description?: string;
  readonly aliases?: readonly string[];
  readonly category?: string;
  readonly tags?: readonly string[];
  /** Semantic role (e.g. "action", "status", "navigation"). */
  readonly semantic?: string;
}

/** A single entry mapping a canonical name to a provider-native name. */
export interface ProviderMappingEntry {
  readonly canonicalName: CanonicalIconName;
  readonly nativeName: NativeName;
  readonly aliases?: readonly string[];
  readonly availableStyles?: readonly string[];
  readonly availableWeights?: readonly string[];
}

/** The full JSON structure of a provider mapping catalogue file. */
export interface ProviderCatalogueFile {
  readonly providerId: ProviderId;
  /** Version of the icon library this catalogue was generated from. */
  readonly providerVersion: string;
  readonly catalogueSchemaVersion: string;
  readonly generatedAt: string;
  readonly entries: readonly ProviderMappingEntry[];
}

/** The full JSON structure of the Celestial canonical catalogue file. */
export interface CanonicalCatalogueFile {
  readonly schemaVersion: string;
  readonly updatedAt: string;
  readonly entries: readonly CanonicalCatalogueEntry[];
}

// ─── Application Icon Configuration ──────────────────────────────────────────

/**
 * Behaviour when an icon cannot be resolved by any available provider.
 * - `empty`          → return a resolution with `status: 'missing'` and no payload.
 * - `fallback-icon`  → re-resolve using a designated fallback canonical icon name.
 * - `error`          → throw `IconResolutionError`.
 */
export type MissingIconPolicy =
  | { readonly kind: 'empty' }
  | { readonly kind: 'fallback-icon'; readonly canonicalName: CanonicalIconName }
  | { readonly kind: 'error' };

/**
 * Behaviour when an **explicit** provider (`IconRequest.provider`) fails.
 * - `apply-missing-policy`  → apply the configured `missingIconPolicy` (default).
 * - `allow-fallback`        → fall through to configured fallback providers.
 */
export type ExplicitProviderPolicy = 'apply-missing-policy' | 'allow-fallback';

/**
 * Application-level icon system configuration.
 * Set once via `configureCelestialIcons()` or through a framework provider.
 */
export interface IconConfig {
  /** Default provider ID. Used when `IconRequest.provider` is not set. */
  readonly provider: ProviderId;
  /**
   * Ordered list of fallback providers.
   * Evaluated in declared order when the primary provider cannot satisfy a request.
   */
  readonly fallback?: readonly ProviderId[];
  /**
   * Behaviour when no provider can satisfy the request.
   * Defaults to `{ kind: 'empty' }`.
   */
  readonly missingIconPolicy?: MissingIconPolicy;
  /**
   * Behaviour when an explicitly requested provider (`IconRequest.provider`) fails.
   * Defaults to `'apply-missing-policy'` — no silent fallback to other providers.
   */
  readonly explicitProviderPolicy?: ExplicitProviderPolicy;
  /**
   * When `true`, the resolver emits diagnostic information in `IconResolution.diagnostics`.
   * Recommended for development builds; avoid in production for performance.
   */
  readonly diagnostics?: boolean;
}

/**
 * Structural hint copied from `@celestial-ui/theme` `IconProviderConfig`.
 * Defined here so `@celestial-ui/icons` does not depend on theme.
 */
export interface IconThemeHint {
  readonly provider: string;
  readonly options?: Readonly<Record<string, string | number | boolean>>;
}

// ─── Resolution Result ────────────────────────────────────────────────────────

/**
 * Resolution status codes.
 * - `resolved`              → primary provider satisfied the request.
 * - `resolved-via-fallback` → a fallback provider satisfied the request.
 * - `missing`               → no provider could satisfy; `missingIconPolicy` was applied.
 * - `error`                 → an unrecoverable error occurred.
 */
export type ResolutionStatus =
  | 'resolved'
  | 'resolved-via-fallback'
  | 'missing'
  | 'error';

/**
 * Diagnostic information attached when `IconConfig.diagnostics: true`.
 * Not present in production builds unless explicitly enabled.
 */
export interface ResolutionDiagnostics {
  /** Providers that were tried, in the order they were evaluated. */
  readonly triedProviders: readonly ProviderId[];
  /** Human-readable reason the resolution fell short of a primary hit. */
  readonly reason: string;
}

/**
 * The authoritative result of a single icon resolution.
 * Produced by `resolveIcon()` in `resolver.ts`.
 */
export interface IconResolution {
  /** The original request that produced this resolution. */
  readonly request: Readonly<IconRequest>;
  /**
   * The resolved canonical name.
   * May differ from `request.name` if an alias was used as input.
   */
  readonly canonicalName: CanonicalIconName;
  /** The provider that ultimately served the icon. `null` on `missing` or `error` status. */
  readonly resolvedProviderId: ProviderId | null;
  /** The provider-native icon name. `null` on `missing` or `error` status. */
  readonly nativeName: NativeName | null;
  /** `true` when a fallback provider was used instead of the primary. */
  readonly fallbackOccurred: boolean;
  /** The normalized payload for rendering. `null` on `missing` or `error` status. */
  readonly payload: NormalizedIconPayload | null;
  readonly status: ResolutionStatus;
  /** Present when `IconConfig.diagnostics: true` or when status is not `resolved`. */
  readonly diagnostics?: Readonly<ResolutionDiagnostics>;
}

// ─── Validation Report ────────────────────────────────────────────────────────

/** Reusable validation result shape (mirrors pattern from @celestial-ui/tokens). */
export interface IconValidationReport {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}
