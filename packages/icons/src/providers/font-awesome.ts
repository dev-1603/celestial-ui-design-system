/**
 * Font Awesome Free provider adapter.
 *
 * Tree-shakeable: import explicitly from the subpath.
 *
 * Peers (optional): `@fortawesome/fontawesome-svg-core` plus
 * `@fortawesome/free-solid-svg-icons` and/or `@fortawesome/free-regular-svg-icons`.
 * Each is loaded with a static `require('…')` so bundlers can see the specifier.
 * This adapter does not import `../peers`.
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
  IconVariantRequest,
  NormalizedIconPayload,
  ProviderCapabilities,
} from '../types';
import { PROVIDER_CONTRACT_VERSION } from '../version';
import { createNativeNameLookup } from '../mapping';
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

function loadFaCore(): FaCore | undefined {
  try {
    return require('@fortawesome/fontawesome-svg-core') as FaCore;
  } catch {
    return undefined;
  }
}

function loadFaSolid(): FaIconPack | undefined {
  try {
    return require('@fortawesome/free-solid-svg-icons') as FaIconPack;
  } catch {
    return undefined;
  }
}

function loadFaRegular(): FaIconPack | undefined {
  try {
    return require('@fortawesome/free-regular-svg-icons') as FaIconPack;
  } catch {
    return undefined;
  }
}

function readFaCoreVersion(): string {
  try {
    const pkg = require('@fortawesome/fontawesome-svg-core/package.json') as { version?: unknown };
    return typeof pkg.version === 'string' ? pkg.version : 'installed';
  } catch {
    return loadFaCore() ? 'installed' : 'uninstalled';
  }
}

function loadFaSvg(nativeName: string, style: string): string | undefined {
  const core = loadFaCore();
  if (!core?.icon) return undefined;

  const pack = style === 'regular' ? loadFaRegular() : loadFaSolid();
  if (!pack) return undefined;

  const def = pack[toFontAwesomeExportName(nativeName)];
  if (!def) return undefined;

  const svg = core.icon(def);
  return svg?.html?.[0];
}

export const FontAwesomeAdapter: IconProviderAdapter = {
  id: 'fa',
  displayName: 'Font Awesome Free',
  version: readFaCoreVersion(),
  catalogueSchemaVersion: PROVIDER_CONTRACT_VERSION,
  capabilities: FA_CAPABILITIES,

  resolveNativeName(canonicalName: string): string | undefined {
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
