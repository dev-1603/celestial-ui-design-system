/**
 * Heroicons v2 provider adapter.
 *
 * Peer: `heroicons` (optional). The package has no JS entry — only SVG files
 * under `24/outline`, `24/solid`, `20/solid`, and `16/solid`.
 *
 * Node-only: SVG files are read with `fs` via `../peers`. Not a verified
 * browser contract; use Lucide (or Material font-class) in the client.
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
import heroiconsCatalogue from '../data/mappings/heroicons.json';

const HEROICONS_CAPABILITIES: ProviderCapabilities = {
  styles: ['outline', 'solid', 'mini', 'micro'],
  weights: [],
  colorModes: ['monochrome'],
  supportsArbitrarySize: true,
  supportsSSR: true,
};

const lookup = createNativeNameLookup(heroiconsCatalogue);

function heroiconsAssetPath(nativeName: string, style: string): string {
  const stem = toAssetStem(nativeName);
  switch (style) {
    case 'solid':
      return `24/solid/${stem}.svg`;
    case 'mini':
      return `20/solid/${stem}.svg`;
    case 'micro':
      return `16/solid/${stem}.svg`;
    case 'outline':
    default:
      return `24/outline/${stem}.svg`;
  }
}

export const HeroiconsAdapter: IconProviderAdapter = {
  id: 'heroicons',
  displayName: 'Heroicons',
  version: readPeerPackageVersion('heroicons') ?? 'uninstalled',
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
    const svgString = readOptionalPeerAsset('heroicons', heroiconsAssetPath(nativeName, style));
    if (!svgString) return undefined;

    return {
      kind: 'svg-string',
      data: svgString,
      nativeName,
      resolvedVariant: {
        style: style as 'outline' | 'solid' | 'mini' | 'micro',
        colorMode: 'monochrome',
      },
    };
  },
};
