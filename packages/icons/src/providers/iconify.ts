/**
 * Iconify aggregation provider adapter.
 *
 * Peer: `@iconify/utils` (optional) plus `@iconify-json/{prefix}` for each
 * collection. NEVER import `@iconify/json`.
 *
 * `@iconify/utils` and `@iconify-json/ph` use static `require()` (bundler-visible).
 * Other `@iconify-json/<prefix>` collections load through Node `createRequire`
 * and are not a verified browser contract.
 *
 * Native names are `prefix:name` (e.g. `ph:magnifying-glass`).
 * Per-request / SSR: `createIconifyAdapter({ collection: 'mdi' })` and register
 * that instance on a request-local registry. Do not mutate process state.
 *
 * Licensing is per collection. See https://icon-sets.iconify.design/
 */
import type {
  IconProviderAdapter,
  IconVariantRequest,
  NormalizedIconPayload,
  ProviderCapabilities,
} from '../types';
import { PROVIDER_CONTRACT_VERSION } from '../version';
import { createNativeNameLookup } from '../mapping';
import { loadOptionalPeer } from '../peers';
import { isValidIconName } from '../ids';
import iconifyCatalogue from '../data/mappings/iconify.json';

const ICONIFY_CAPABILITIES: ProviderCapabilities = {
  styles: [],
  weights: [],
  colorModes: ['monochrome', 'duotone', 'multicolor'],
  supportsArbitrarySize: true,
  supportsSSR: true,
};

const ICONIFY_PREFIX_PATTERN = /^[a-z][a-z0-9-]*$/;

const lookup = createNativeNameLookup(iconifyCatalogue);

export interface IconifyAdapterOptions {
  /**
   * Rewrite the catalogue prefix (`ph:name` → `{collection}:name`).
   * Does not mutate process-wide state — bind it on the returned adapter.
   */
  collection?: string;
  /** Inject an Iconify JSON document (tests / custom collections). */
  iconSet?: unknown;
}

interface IconifyUtils {
  getIconData: (collection: unknown, name: string) => unknown;
  iconToSVG: (data: unknown) => {
    body?: string;
    attributes?: Record<string, string>;
  };
  iconToHTML: (body: string, attributes: Record<string, string>) => string;
}

function applyCollectionOverride(nativeName: string, collection: string | undefined): string {
  if (!collection) return nativeName;
  const colon = nativeName.indexOf(':');
  const local = colon >= 0 ? nativeName.slice(colon + 1) : nativeName;
  return `${collection}:${local}`;
}

function unwrapIconifyJson(pack: unknown): unknown {
  if (!pack || typeof pack !== 'object') return undefined;
  const rec = pack as Record<string, unknown>;
  if (typeof rec['prefix'] === 'string' && rec['icons'] && typeof rec['icons'] === 'object') {
    return pack;
  }
  const nested = rec['icons'];
  if (nested && typeof nested === 'object' && nested !== null && 'icons' in nested) {
    return nested;
  }
  return pack;
}

function loadIconifyUtils(): IconifyUtils | undefined {
  try {
    return require('@iconify/utils') as IconifyUtils;
  } catch {
    return undefined;
  }
}

function readIconifyUtilsVersion(): string {
  try {
    const pkg = require('@iconify/utils/package.json') as { version?: unknown };
    return typeof pkg.version === 'string' ? pkg.version : 'installed';
  } catch {
    return loadIconifyUtils() ? 'installed' : 'uninstalled';
  }
}

function loadIconifyCollection(prefix: string): unknown {
  if (!ICONIFY_PREFIX_PATTERN.test(prefix)) return undefined;
  if (prefix === 'ph') {
    try {
      return unwrapIconifyJson(require('@iconify-json/ph'));
    } catch {
      /* fall through to dynamic Node load */
    }
  }
  // Dynamic prefix: Node `createRequire` via peers (not browser-safe).
  const pack = loadOptionalPeer<unknown>(`@iconify-json/${prefix}`);
  return unwrapIconifyJson(pack);
}

function loadIconifySvg(nativeName: string, iconSetOverride: unknown): string | undefined {
  const colonIdx = nativeName.indexOf(':');
  if (colonIdx < 0) return undefined;

  const prefix = nativeName.slice(0, colonIdx);
  const name = nativeName.slice(colonIdx + 1);
  if (!ICONIFY_PREFIX_PATTERN.test(prefix) || !isValidIconName(name)) return undefined;

  const utils = loadIconifyUtils();
  if (!utils?.getIconData || !utils.iconToSVG || !utils.iconToHTML) return undefined;

  const collection = unwrapIconifyJson(iconSetOverride) ?? loadIconifyCollection(prefix);
  if (!collection) return undefined;

  const iconData = utils.getIconData(collection, name);
  if (!iconData) return undefined;

  const built = utils.iconToSVG(iconData);
  if (!built?.body) return undefined;
  const attributes = {
    xmlns: 'http://www.w3.org/2000/svg',
    ...built.attributes,
  };
  return utils.iconToHTML(built.body, attributes);
}

export function createIconifyAdapter(options: IconifyAdapterOptions = {}): IconProviderAdapter {
  const collection = options.collection?.trim() || undefined;
  if (collection && !ICONIFY_PREFIX_PATTERN.test(collection)) {
    throw new Error(`Invalid Iconify collection prefix '${collection}'.`);
  }

  return {
    id: 'iconify',
    displayName: 'Iconify',
    version: readIconifyUtilsVersion(),
    catalogueSchemaVersion: PROVIDER_CONTRACT_VERSION,
    capabilities: ICONIFY_CAPABILITIES,

    resolveNativeName(canonicalName: string): string | undefined {
      const native = lookup(canonicalName);
      return native ? applyCollectionOverride(native, collection) : undefined;
    },

    canSatisfyVariant(_variant: Readonly<IconVariantRequest>): boolean {
      return true;
    },

    resolve(
      nativeName: string,
      _variant: Readonly<IconVariantRequest> | undefined,
    ): NormalizedIconPayload | undefined {
      const svgString = loadIconifySvg(nativeName, options.iconSet);
      if (!svgString) return undefined;

      return {
        kind: 'svg-string',
        data: svgString,
        nativeName,
      };
    },
  };
}

/** Default adapter: catalogue prefixes (`ph:…`) with no collection rewrite. */
export const IconifyAdapter: IconProviderAdapter = createIconifyAdapter();
