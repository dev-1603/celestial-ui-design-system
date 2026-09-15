/**
 * Lucide icon provider adapter.
 *
 * Tree-shakeable: import this file explicitly, do NOT import from the barrel.
 *
 * Catalogue SVG strings are generated at `@celestial-ui/icons` build time from
 * the canonical natives in `lucide.json` (sourced from `lucide-static`). This
 * adapter does not import `../peers` and does not load the full Lucide CJS pack
 * at runtime, so the optional peer stays optional and browser bundles stay
 * catalogue-sized.
 *
 * Importing the adapter still ships every **catalogue** glyph. Runtime
 * `resolveIcon()` name lookup cannot per-call DCE unused icons.
 *
 * SVG Safety: `kind: 'svg-string'`. Framework adapters MUST sanitize before DOM injection.
 */
import type {
  IconProviderAdapter,
  CanonicalIconName,
  IconVariantRequest,
  NormalizedIconPayload,
  ProviderCapabilities,
} from '../types';
import { PROVIDER_CONTRACT_VERSION } from '../version';
import { createNativeNameLookup } from '../mapping';
import lucideCatalogue from '../data/mappings/lucide.json';
import {
  LUCIDE_CATALOGUE_VERSION,
  LUCIDE_SVG_BY_NATIVE_NAME,
} from './generated/lucide-catalogue-svgs';

const LUCIDE_CAPABILITIES: ProviderCapabilities = {
  styles: ['outline'],
  weights: [],
  colorModes: ['monochrome'],
  supportsArbitrarySize: true,
  supportsSSR: true,
};

const lookup = createNativeNameLookup(lucideCatalogue);

export const LucideAdapter: IconProviderAdapter = {
  id: 'lucide',
  displayName: 'Lucide',
  /**
   * Catalogue generation source version (`lucide.json` / `lucide-static`).
   * Describes the supported provider package, not `@celestial-ui/icons`.
   */
  version: LUCIDE_CATALOGUE_VERSION,
  catalogueSchemaVersion: PROVIDER_CONTRACT_VERSION,
  capabilities: LUCIDE_CAPABILITIES,

  resolveNativeName(canonicalName: CanonicalIconName): string | undefined {
    return lookup(canonicalName);
  },

  canSatisfyVariant(variant: Readonly<IconVariantRequest>): boolean {
    if (variant.style && variant.style !== 'outline') return false;
    if (variant.colorMode && variant.colorMode !== 'monochrome') return false;
    if (variant.weight) return false;
    return true;
  },

  resolve(
    nativeName: string,
    _variant: Readonly<IconVariantRequest> | undefined,
  ): NormalizedIconPayload | undefined {
    const svgString = LUCIDE_SVG_BY_NATIVE_NAME[nativeName];
    if (typeof svgString !== 'string' || !svgString.includes('<svg')) return undefined;

    return {
      kind: 'svg-string',
      data: svgString,
      nativeName,
      resolvedVariant: { style: 'outline', colorMode: 'monochrome' },
    };
  },
};

/** Alias of {@link LucideAdapter}. Same object, same `IconProviderAdapter` contract. */
export const lucide = LucideAdapter;
