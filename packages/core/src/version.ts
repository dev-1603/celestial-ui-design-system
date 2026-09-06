/** Package version of @celestial-ui/core. */
export const CORE_PACKAGE_VERSION = '0.1.0';

/** Schema version for ComponentContract shape. */
export const CONTRACT_SCHEMA_VERSION = '1.1.0';

/** Schema version for ComponentSpec wrapper. */
export const SPEC_SCHEMA_VERSION = '1.1.0';

/** Contract version for CelestialPlugin context API. */
export const PLUGIN_CONTRACT_VERSION = '1.0.0';

/** Returns true when schema major versions match (V1 policy). */
export function isSchemaCompatible(schemaVersion: string, current: string): boolean {
  const [schemaMajor] = schemaVersion.split('.');
  const [currentMajor] = current.split('.');
  return schemaMajor === currentMajor;
}
