/**
 * Lucide icon provider adapter.
 *
 * Tree-shakeable: import this file explicitly, do NOT import from the barrel.
 *
 * Peer: `lucide-static` (optional). V1 loads the package once (fixed specifier)
 * and indexes the PascalCase native name from the mapping catalogue. That is
 * the API lucide-static 1.x actually ships (named SVG strings). Per-icon
 * tree-shaking is not available at the resolver layer because the canonical
 * name is chosen at runtime.
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
import { loadOptionalPeer, readPeerPackageVersion } from '../peers';
import lucideCatalogue from '../data/mappings/lucide.json';

const LUCIDE_CAPABILITIES: ProviderCapabilities = {
  styles: ['outline'],
  weights: [],
  colorModes: ['monochrome'],
  supportsArbitrarySize: true,
  supportsSSR: true,
};

const lookup = createNativeNameLookup(lucideCatalogue);

function loadLucideSvg(nativeName: string): string | undefined {
  const pack = loadOptionalPeer<Record<string, unknown>>('lucide-static');
  if (!pack) return undefined;
  const svg = pack[nativeName];
  return typeof svg === 'string' && svg.includes('<svg') ? svg : undefined;
}

export const LucideAdapter: IconProviderAdapter = {
  id: 'lucide',
  displayName: 'Lucide',
  /**
   * Installed `lucide-static` version when the peer is present.
   * Describes the supported provider package, not `@celestial-ui/icons`.
   */
  version: readPeerPackageVersion('lucide-static') ?? 'uninstalled',
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
    const svgString = loadLucideSvg(nativeName);
    if (!svgString) return undefined;

    return {
      kind: 'svg-string',
      data: svgString,
      nativeName,
      resolvedVariant: { style: 'outline', colorMode: 'monochrome' },
    };
  },
};
