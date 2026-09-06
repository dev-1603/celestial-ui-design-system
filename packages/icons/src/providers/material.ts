/**
 * Google Material Symbols provider adapter.
 *
 * Rendering strategy: `font-class` payload.
 * Requires the Material Symbols variable font CSS to be loaded by the app.
 *
 * Celestial `outline` maps to Material `outlined`.
 *
 * Native ligature names are validated before they are placed in the class string.
 *
 * SSR: class + ligature text is emitted; glyphs appear after the font loads.
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
import { isValidMaterialLigature } from '../ids';
import materialCatalogue from '../data/mappings/material.json';

const MATERIAL_CAPABILITIES: ProviderCapabilities = {
  styles: ['outlined', 'outline', 'rounded', 'sharp'],
  weights: ['thin', 'light', 'regular', 'bold'],
  colorModes: ['monochrome'],
  supportsArbitrarySize: true,
  supportsSSR: true,
};

const STYLE_TO_CLASS: Record<string, string> = {
  outlined: 'material-symbols-outlined',
  rounded: 'material-symbols-rounded',
  sharp: 'material-symbols-sharp',
  outline: 'material-symbols-outlined',
};

/** No npm peer — version names the CSS contract, not a package. */
export const MATERIAL_SYMBOLS_CONTRACT_VERSION = 'variable-font';

const lookup = createNativeNameLookup(materialCatalogue);

export const MaterialSymbolsAdapter: IconProviderAdapter = {
  id: 'material',
  displayName: 'Google Material Symbols',
  version: MATERIAL_SYMBOLS_CONTRACT_VERSION,
  catalogueSchemaVersion: PROVIDER_CONTRACT_VERSION,
  capabilities: MATERIAL_CAPABILITIES,

  resolveNativeName(canonicalName: CanonicalIconName): string | undefined {
    return lookup(canonicalName);
  },

  canSatisfyVariant(variant: Readonly<IconVariantRequest>): boolean {
    if (variant.colorMode && variant.colorMode !== 'monochrome') return false;
    if (variant.style && !STYLE_TO_CLASS[variant.style]) return false;
    if (variant.weight && !MATERIAL_CAPABILITIES.weights.includes(variant.weight)) return false;
    return true;
  },

  resolve(
    nativeName: string,
    variant: Readonly<IconVariantRequest> | undefined,
  ): NormalizedIconPayload | undefined {
    if (!isValidMaterialLigature(nativeName)) return undefined;

    const style = variant?.style ?? 'outlined';
    const cssClass = STYLE_TO_CLASS[style] ?? 'material-symbols-outlined';

    return {
      kind: 'font-class',
      data: `${cssClass} ${nativeName}`,
      nativeName,
      resolvedVariant: { style, colorMode: 'monochrome' },
    };
  },
};
