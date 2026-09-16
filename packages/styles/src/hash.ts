/**
 * Locale-independent UTF-16 code-unit order. Same as default Array#sort for
 * strings, without relying on the host locale.
 */
export function compareUtf16(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Deterministic content hash for compiled CSS artifacts.
 * Uses djb2 over sorted variable keys and values.
 */
export function computeContentHash(
  variables: Readonly<Record<string, string>>,
  selector: string,
  metadata: Record<string, string>,
): string {
  const parts: string[] = [selector];
  const sortedKeys = Object.keys(variables).sort(compareUtf16);
  for (const key of sortedKeys) {
    parts.push(`${key}=${variables[key]}`);
  }
  const metaKeys = Object.keys(metadata).sort(compareUtf16);
  for (const key of metaKeys) {
    parts.push(`@${key}=${metadata[key]}`);
  }
  const input = parts.join('\n');
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return `cui-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
