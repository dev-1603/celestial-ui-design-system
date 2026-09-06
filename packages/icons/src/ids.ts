/**
 * Shared identity validators for canonical icon names and provider IDs.
 * Used by request validation, config, and provider registration.
 */

/** Canonical names and aliases: lowercase alphanumeric with hyphens, starting with a letter. */
export const ICON_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

/** Provider IDs: letter start, then alphanumeric / hyphen / underscore, max 64 chars. */
export const PROVIDER_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;

/** Material Symbols ligature names (underscores allowed; no CSS metacharacters). */
export const MATERIAL_LIGATURE_PATTERN = /^[a-z][a-z0-9_]*$/;

export function isValidIconName(name: string): boolean {
  return typeof name === 'string' && ICON_NAME_PATTERN.test(name);
}

export function isValidProviderId(id: string): boolean {
  return typeof id === 'string' && PROVIDER_ID_PATTERN.test(id);
}

export function isValidMaterialLigature(name: string): boolean {
  return typeof name === 'string' && MATERIAL_LIGATURE_PATTERN.test(name);
}
