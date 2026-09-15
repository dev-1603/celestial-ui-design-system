/**
 * Provider-native name helpers. Canonical names stay kebab-case Celestial IDs.
 */

/** PascalCase or mixed native name → asset stem (Heroicons / Phosphor files). */
export function toAssetStem(nativeName: string): string {
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nativeName)) return nativeName;
  return nativeName
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .replace(/(\d)([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/** Font Awesome kebab iconName → pack export (magnifying-glass → faMagnifyingGlass). */
export function toFontAwesomeExportName(nativeName: string): string {
  const parts = nativeName.split('-').filter(Boolean);
  return `fa${parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`;
}
