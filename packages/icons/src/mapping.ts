/**
 * Mapping engine.
 *
 * Authoritative canonical → native lookup. Provider adapters must use
 * `createNativeNameLookup` with their own catalogue JSON — they must not
 * keep a parallel name table.
 *
 * INVARIANTS:
 * - No network I/O. Catalogues are bundled JSON imported by the adapter.
 * - A missing entry is `undefined`, not an error. The resolver handles fallback.
 */
import type { CanonicalIconName, NativeName, ProviderCatalogueFile } from './types';
import { iconError, IconResolutionError } from './errors';
import { validateProviderCatalogue } from './catalogue/validate';
import { isCatalogueCompatible } from './version';

export type NativeNameLookup = (canonicalName: CanonicalIconName) => NativeName | undefined;

export function createNativeNameLookup(data: unknown): NativeNameLookup {
  const catalogue = loadValidatedCatalogue(data);
  const map = new Map<CanonicalIconName, NativeName>();
  for (const entry of catalogue.entries) {
    map.set(entry.canonicalName, entry.nativeName);
  }
  return (canonicalName) => map.get(canonicalName);
}

function loadValidatedCatalogue(data: unknown): ProviderCatalogueFile {
  const result = validateProviderCatalogue(data);
  if (!result.isValid) {
    throw new IconResolutionError(
      `Provider catalogue failed validation: ${result.errors[0] ?? 'unknown error'}`,
      iconError('CATALOGUE_INVALID', result.errors.join('; '), { layer: 'catalogue' }),
    );
  }

  const catalogue = data as ProviderCatalogueFile;
  if (!isCatalogueCompatible(catalogue.catalogueSchemaVersion)) {
    throw new IconResolutionError(
      `Catalogue for '${catalogue.providerId}' has incompatible schema version '${catalogue.catalogueSchemaVersion}'.`,
      iconError(
        'CATALOGUE_SCHEMA_MISMATCH',
        `Schema version mismatch for provider '${catalogue.providerId}'.`,
        { layer: 'catalogue', providerId: catalogue.providerId },
      ),
    );
  }

  return catalogue;
}
