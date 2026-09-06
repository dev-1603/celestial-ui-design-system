/**
 * @celestial-ui/icons
 *
 * Provider-neutral icon system for the Celestial Nexus ecosystem.
 *
 * Public API surface:
 * - Types: see types.ts
 * - Errors: IconResolutionError, IconProviderRegistrationError
 * - Resolution: resolveIcon()
 * - Application config: configureCelestialIcons(), getIconConfig(),
 *   iconConfigFromThemeHint(), iconConfigFromResolvedTheme()
 * - Provider registry: registerIconProvider(), defaultIconProviderRegistry, IconProviderRegistry
 * - Canonical registry: canonicalRegistry, CanonicalRegistry
 *
 * Provider adapters are intentionally NOT exported from this barrel.
 * Import them directly for tree-shaking:
 *   import { LucideAdapter } from '@celestial-ui/icons/providers/lucide';
 *   import { FontAwesomeAdapter } from '@celestial-ui/icons/providers/font-awesome';
 *   import { MaterialSymbolsAdapter } from '@celestial-ui/icons/providers/material';
 *   import { HeroiconsAdapter } from '@celestial-ui/icons/providers/heroicons';
 *   import { PhosphorAdapter } from '@celestial-ui/icons/providers/phosphor';
 *   import { IconifyAdapter, createIconifyAdapter } from '@celestial-ui/icons/providers/iconify';
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  CanonicalIconName,
  ProviderId,
  NativeName,
  BuiltInProviderId,
  IconVariantRequest,
  IconRequest,
  ProviderCapabilities,
  IconPayloadKind,
  NormalizedIconPayload,
  IconProviderAdapter,
  CanonicalCatalogueEntry,
  ProviderMappingEntry,
  ProviderCatalogueFile,
  CanonicalCatalogueFile,
  MissingIconPolicy,
  ExplicitProviderPolicy,
  IconConfig,
  ResolutionStatus,
  ResolutionDiagnostics,
  IconResolution,
  IconValidationReport,
  IconThemeHint,
} from './types';

// ─── Errors ───────────────────────────────────────────────────────────────────
export {
  iconError,
  IconResolutionError,
  IconProviderRegistrationError,
} from './errors';
export type { IconError, IconErrorCode, IconErrorLayer } from './errors';

// ─── Version ──────────────────────────────────────────────────────────────────
export {
  ICON_SYSTEM_VERSION,
  CANONICAL_CATALOGUE_SCHEMA_VERSION,
  PROVIDER_CATALOGUE_SCHEMA_VERSION,
  PROVIDER_CONTRACT_VERSION,
  isCatalogueCompatible,
} from './version';

// ─── Provider Registry ────────────────────────────────────────────────────────
export {
  IconProviderRegistry,
  defaultIconProviderRegistry,
  registerIconProvider,
} from './provider-registry';

// ─── Canonical Registry ───────────────────────────────────────────────────────
export { CanonicalRegistry, canonicalRegistry } from './canonical-registry';

// ─── Application Config ───────────────────────────────────────────────────────
export {
  configureCelestialIcons,
  getIconConfig,
  iconConfigFromThemeHint,
  iconConfigFromResolvedTheme,
  /** @internal — do not use in application code */ _resetIconConfig,
} from './config';

// ─── Resolver ─────────────────────────────────────────────────────────────────
export { resolveIcon } from './resolver';
export type { ResolveIconOptions } from './resolver';

// ─── Catalogue Validation ─────────────────────────────────────────────────────
export {
  validateCanonicalCatalogue,
  validateProviderCatalogue,
} from './catalogue/validate';
