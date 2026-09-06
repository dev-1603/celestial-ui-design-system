/**
 * JSON schema types for catalogue files.
 * These match the JSON structures in src/data/.
 */

import type {
  CanonicalCatalogueFile,
  ProviderCatalogueFile,
} from '../types';

export type { CanonicalCatalogueFile, ProviderCatalogueFile };

/** Supported catalogue schema version string for this release. */
export const CURRENT_CANONICAL_SCHEMA_VERSION = '1.0.0';
export const CURRENT_PROVIDER_SCHEMA_VERSION = '1.0.0';
