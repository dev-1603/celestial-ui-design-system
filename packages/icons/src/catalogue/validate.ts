/**
 * Catalogue validation.
 *
 * Validates catalogue JSON files against the expected schema.
 * Used by tests and the future catalogue generation CLI.
 */
import type { IconValidationReport, CanonicalCatalogueFile, ProviderCatalogueFile } from '../types';
import { CURRENT_CANONICAL_SCHEMA_VERSION, CURRENT_PROVIDER_SCHEMA_VERSION } from './schema';
import { isValidIconName } from '../ids';

export function validateCanonicalCatalogue(data: unknown): IconValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Catalogue must be a JSON object.'], warnings };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj['schemaVersion'] !== 'string') {
    errors.push("Missing required field 'schemaVersion'.");
  } else if (obj['schemaVersion'] !== CURRENT_CANONICAL_SCHEMA_VERSION) {
    warnings.push(
      `Catalogue schemaVersion '${obj['schemaVersion']}' does not match current '${CURRENT_CANONICAL_SCHEMA_VERSION}'.`,
    );
  }

  if (typeof obj['updatedAt'] !== 'string') {
    errors.push("Missing required field 'updatedAt'.");
  }

  if (!Array.isArray(obj['entries'])) {
    errors.push("Missing required field 'entries' (must be an array).");
    return { isValid: errors.length === 0, errors, warnings };
  }

  const seenNames = new Set<string>();
  const entries = obj['entries'] as unknown[];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] as Record<string, unknown>;
    if (!entry || typeof entry !== 'object') {
      errors.push(`Entry at index ${i} must be an object.`);
      continue;
    }
    if (typeof entry['name'] !== 'string' || !entry['name'].trim()) {
      errors.push(`Entry at index ${i} is missing a valid 'name'.`);
      continue;
    }
    const name = entry['name'] as string;
    if (!isValidIconName(name)) {
      errors.push(`Entry at index ${i} has invalid name '${name}'.`);
    }
    if (seenNames.has(name)) {
      errors.push(`Duplicate canonical name '${name}' at index ${i}.`);
    }
    seenNames.add(name);
  }

  const seenAliases = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] as Record<string, unknown>;
    if (!entry || typeof entry !== 'object' || !Array.isArray(entry['aliases'])) continue;
    const owner = typeof entry['name'] === 'string' ? (entry['name'] as string) : `index ${i}`;
    for (const alias of entry['aliases'] as unknown[]) {
      if (typeof alias !== 'string' || !isValidIconName(alias)) {
        errors.push(`Entry '${owner}' has invalid alias '${String(alias)}'.`);
        continue;
      }
      if (alias === owner) {
        errors.push(`Entry '${owner}' lists itself as an alias.`);
        continue;
      }
      if (seenNames.has(alias)) {
        errors.push(`Alias '${alias}' on '${owner}' collides with a canonical name.`);
      }
      if (seenAliases.has(alias)) {
        errors.push(`Duplicate alias '${alias}' on '${owner}'.`);
      }
      seenAliases.add(alias);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateProviderCatalogue(
  data: unknown,
  knownCanonicalNames?: ReadonlySet<string>,
): IconValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Provider catalogue must be a JSON object.'], warnings };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj['providerId'] !== 'string' || !obj['providerId']) {
    errors.push("Missing required field 'providerId'.");
  }

  if (typeof obj['providerVersion'] !== 'string') {
    errors.push("Missing required field 'providerVersion'.");
  }

  if (typeof obj['catalogueSchemaVersion'] !== 'string') {
    errors.push("Missing required field 'catalogueSchemaVersion'.");
  } else if (obj['catalogueSchemaVersion'] !== CURRENT_PROVIDER_SCHEMA_VERSION) {
    warnings.push(
      `Catalogue catalogueSchemaVersion '${obj['catalogueSchemaVersion']}' does not match current '${CURRENT_PROVIDER_SCHEMA_VERSION}'.`,
    );
  }

  if (typeof obj['generatedAt'] !== 'string') {
    errors.push("Missing required field 'generatedAt'.");
  }

  if (!Array.isArray(obj['entries'])) {
    errors.push("Missing required field 'entries' (must be an array).");
    return { isValid: errors.length === 0, errors, warnings };
  }

  const seenCanonicalNames = new Set<string>();

  for (let i = 0; i < (obj['entries'] as unknown[]).length; i++) {
    const entry = (obj['entries'] as unknown[])[i] as Record<string, unknown>;
    if (!entry || typeof entry !== 'object') {
      errors.push(`Entry at index ${i} must be an object.`);
      continue;
    }
    if (typeof entry['canonicalName'] !== 'string' || !entry['canonicalName']) {
      errors.push(`Entry at index ${i} is missing a valid 'canonicalName'.`);
      continue;
    }
    if (typeof entry['nativeName'] !== 'string' || !entry['nativeName']) {
      errors.push(
        `Entry at index ${i} (${entry['canonicalName']}) is missing a valid 'nativeName'.`,
      );
      continue;
    }
    const canonicalName = entry['canonicalName'] as string;
    if (seenCanonicalNames.has(canonicalName)) {
      errors.push(`Duplicate canonicalName '${canonicalName}' at index ${i}.`);
    }
    seenCanonicalNames.add(canonicalName);

    if (knownCanonicalNames && !knownCanonicalNames.has(canonicalName)) {
      warnings.push(
        `Entry '${canonicalName}' at index ${i} is not in the canonical catalogue. It may be outdated.`,
      );
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// Re-export types for convenience in catalogue tooling
export type { CanonicalCatalogueFile, ProviderCatalogueFile };
