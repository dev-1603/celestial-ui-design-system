/**
 * Font Awesome Free provider adapter.
 *
 * Tree-shakeable: import explicitly from the subpath.
 *
 * Peers (optional): `@fortawesome/fontawesome-svg-core` plus
 * `@fortawesome/free-solid-svg-icons` and/or `@fortawesome/free-regular-svg-icons`.
 *
 * Resolution looks up the pack export (`faMagnifyingGlass`) and calls `icon(def)`.
 * It does not rely on a previously populated `library` singleton.
 *
 * Font Awesome Pro is NOT bundled. Implement a custom `IconProviderAdapter`.
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
import { loadOptionalPeer, readPeerPackageVersion } from '../peers';
import { toFontAwesomeExportName } from '../names';
import faCatalogue from '../data/mappings/fa.json';

const FA_CAPABILITIES: ProviderCapabilities = {
  styles: ['solid', 'regular'],
  weights: [],
  colorModes: ['monochrome'],
  supportsArbitrarySize: true,
  supportsSSR: true,
};

const lookup = createNativeNameLookup(faCatalogue);

interface FaIconPack {
  [exportName: string]: unknown;
}

interface FaCore {
  icon: (def: unknown) => { html?: string[] };
}

function loadFaSvg(nativeName: string, style: string): string | undefined {
  const core = loadOptionalPeer<FaCore>('@fortawesome/fontawesome-svg-core');
  if (!core?.icon) return undefined;

  const packName =
    style === 'regular'
      ? '@fortawesome/free-regular-svg-icons'
      : '@fortawesome/free-solid-svg-icons';
  const pack = loadOptionalPeer<FaIconPack>(packName);
  if (!pack) return undefined;

  const def = pack[toFontAwesomeExportName(nativeName)];
  if (!def) return undefined;

  const svg = core.icon(def);
  return svg?.html?.[0];
}

export const FontAwesomeAdapter: IconProviderAdapter = {
  id: 'fa',
  displayName: 'Font Awesome Free',
  version: readPeerPackageVersion('@fortawesome/fontawesome-svg-core') ?? 'uninstalled',
  catalogueSchemaVersion: PROVIDER_CONTRACT_VERSION,
  capabilities: FA_CAPABILITIES,

  resolveNativeName(canonicalName: CanonicalIconName): string | undefined {
    return lookup(canonicalName);
  },

  canSatisfyVariant(variant: Readonly<IconVariantRequest>): boolean {
    if (variant.style && !['solid', 'regular'].includes(variant.style)) return false;
    if (variant.colorMode && variant.colorMode !== 'monochrome') return false;
    if (variant.weight) return false;
    return true;
  },

  resolve(
    nativeName: string,
    variant: Readonly<IconVariantRequest> | undefined,
  ): NormalizedIconPayload | undefined {
    const style = variant?.style === 'regular' ? 'regular' : 'solid';
    const svgString = loadFaSvg(nativeName, style);
    if (!svgString) return undefined;

    return {
      kind: 'svg-string',
      data: svgString,
      nativeName,
      resolvedVariant: { style, colorMode: 'monochrome' },
    };
  },
};
