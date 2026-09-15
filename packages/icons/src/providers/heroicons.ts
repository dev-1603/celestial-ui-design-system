/**
 * Heroicons v2 provider adapter.
 *
 * Peer: `heroicons` (optional, build-time source). The npm package has no JS
 * entry — only SVG files. Catalogue strings are generated at
 * `@celestial-ui/icons` build time so this adapter is browser-safe.
 *
 * Does not import `../peers` (no Node `fs` / `createRequire` / `node:url`).
 *
 * SVG Safety: `kind: 'svg-string'`. Framework adapter must sanitize.
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
import heroiconsCatalogue from '../data/mappings/heroicons.json';
import {
  HEROICONS_CATALOGUE_VERSION,
  HEROICONS_SVG_BY_NATIVE_AND_STYLE,
  type HeroiconsStyle,
} from './generated/heroicons-catalogue-svgs';

const HEROICONS_CAPABILITIES: ProviderCapabilities = {
  styles: ['outline', 'solid', 'mini', 'micro'],
  weights: [],
  colorModes: ['monochrome'],
  supportsArbitrarySize: true,
  supportsSSR: true,
};

const lookup = createNativeNameLookup(heroiconsCatalogue);

function isHeroiconsStyle(style: string): style is HeroiconsStyle {
  return style === 'outline' || style === 'solid' || style === 'mini' || style === 'micro';
}

export const HeroiconsAdapter: IconProviderAdapter = {
  id: 'heroicons',
  displayName: 'Heroicons',
  version: HEROICONS_CATALOGUE_VERSION,
  catalogueSchemaVersion: PROVIDER_CONTRACT_VERSION,
  capabilities: HEROICONS_CAPABILITIES,

  resolveNativeName(canonicalName: CanonicalIconName): string | undefined {
    return lookup(canonicalName);
  },

  canSatisfyVariant(variant: Readonly<IconVariantRequest>): boolean {
    if (variant.colorMode && variant.colorMode !== 'monochrome') return false;
    if (variant.weight) return false;
    if (variant.style && !HEROICONS_CAPABILITIES.styles.includes(variant.style)) return false;
    return true;
  },

  resolve(
    nativeName: string,
    variant: Readonly<IconVariantRequest> | undefined,
  ): NormalizedIconPayload | undefined {
    const style = variant?.style ?? 'outline';
    if (!isHeroiconsStyle(style)) return undefined;
    const svgString = HEROICONS_SVG_BY_NATIVE_AND_STYLE[nativeName]?.[style];
    if (typeof svgString !== 'string' || !svgString.includes('<svg')) return undefined;

    return {
      kind: 'svg-string',
      data: svgString,
      nativeName,
      resolvedVariant: {
        style,
        colorMode: 'monochrome',
      },
    };
  },
};
