/**
 * Phosphor Icons provider adapter.
 *
 * Peer: `@phosphor-icons/core` (optional). That package exports a catalog
 * array plus SVG files under `assets/{weight}/{stem}.svg` — not `Ph*` classes
 * with `toSvg()`.
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
import { readOptionalPeerAsset, readPeerPackageVersion } from '../peers';
import { toAssetStem } from '../names';
import phosphorCatalogue from '../data/mappings/phosphor.json';

const PHOSPHOR_WEIGHTS = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'] as const;
type PhosphorWeight = (typeof PHOSPHOR_WEIGHTS)[number];

const PHOSPHOR_CAPABILITIES: ProviderCapabilities = {
  styles: [...PHOSPHOR_WEIGHTS],
  weights: [...PHOSPHOR_WEIGHTS],
  colorModes: ['monochrome', 'duotone'],
  supportsArbitrarySize: true,
  supportsSSR: true,
};

const lookup = createNativeNameLookup(phosphorCatalogue);

function isPhosphorWeight(value: string): value is PhosphorWeight {
  return (PHOSPHOR_WEIGHTS as readonly string[]).includes(value);
}

function resolveWeight(variant: Readonly<IconVariantRequest> | undefined): PhosphorWeight {
  if (variant?.style && isPhosphorWeight(variant.style)) return variant.style;
  if (variant?.weight && isPhosphorWeight(variant.weight)) return variant.weight;
  return 'regular';
}

export const PhosphorAdapter: IconProviderAdapter = {
  id: 'phosphor',
  displayName: 'Phosphor Icons',
  version: readPeerPackageVersion('@phosphor-icons/core') ?? 'uninstalled',
  catalogueSchemaVersion: PROVIDER_CONTRACT_VERSION,
  capabilities: PHOSPHOR_CAPABILITIES,

  resolveNativeName(canonicalName: CanonicalIconName): string | undefined {
    return lookup(canonicalName);
  },

  canSatisfyVariant(variant: Readonly<IconVariantRequest>): boolean {
    if (variant.style && !isPhosphorWeight(variant.style)) return false;
    if (variant.weight && !isPhosphorWeight(variant.weight)) return false;
    if (variant.colorMode && !['monochrome', 'duotone'].includes(variant.colorMode)) return false;
    if (variant.colorMode === 'duotone') {
      const requested = variant.style ?? variant.weight;
      if (requested !== 'duotone') return false;
    }
    return true;
  },

  resolve(
    nativeName: string,
    variant: Readonly<IconVariantRequest> | undefined,
  ): NormalizedIconPayload | undefined {
    const weight = resolveWeight(variant);
    const stem = toAssetStem(nativeName);
    const svgString = readOptionalPeerAsset('@phosphor-icons/core', `assets/${weight}/${stem}.svg`);
    if (!svgString) return undefined;

    return {
      kind: 'svg-string',
      data: svgString,
      nativeName,
      resolvedVariant: {
        style: weight,
        weight,
        colorMode: weight === 'duotone' ? 'duotone' : 'monochrome',
      },
    };
  },
};
