/**
 * Version constants for @celestial-ui/icons.
 *
 * These constants are embedded in the published package and can be used
 * by tooling and catalogue generators to detect compatibility mismatches.
 */

/**
 * Package version of @celestial-ui/icons (this library).
 * Distinct from `IconProviderAdapter.version`, which is the installed peer
 * icon-library version (or `uninstalled` / a CSS contract id).
 */
export const ICON_SYSTEM_VERSION = '0.1.0';

/**
 * Schema version for canonical catalogue files (`data/canonical.json`).
 * Increment when the canonical catalogue JSON shape changes.
 */
export const CANONICAL_CATALOGUE_SCHEMA_VERSION = '1.0.0';

/**
 * Schema version for provider mapping catalogue files (`data/mappings/*.json`).
 * Increment when the provider catalogue JSON shape changes.
 */
export const PROVIDER_CATALOGUE_SCHEMA_VERSION = '1.0.0';

/**
 * Contract version for `IconProviderAdapter`.
 * Providers must declare `catalogueSchemaVersion` matching this value.
 * Increment when the adapter interface changes in a backward-incompatible way.
 */
export const PROVIDER_CONTRACT_VERSION = '1.0.0';

/**
 * Returns true if the given provider catalogue schema version is compatible
 * with this version of the icons package.
 *
 * V1 policy: major version must match exactly.
 */
export function isCatalogueCompatible(catalogueVersion: string): boolean {
  const [catalogueMajor] = catalogueVersion.split('.');
  const [currentMajor] = PROVIDER_CATALOGUE_SCHEMA_VERSION.split('.');
  return catalogueMajor === currentMajor;
}
