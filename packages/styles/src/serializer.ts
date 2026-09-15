import { tokenPathToVariableName, tokenSubPathToVariableName } from './variable-registry';

/** Deterministic CSS custom property name ordering. */
export function comparePropertyNames(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export function sortDeclarations(
  declarations: Readonly<Record<string, string>>,
): ReadonlyArray<readonly [string, string]> {
  return Object.entries(declarations).sort(([a], [b]) => comparePropertyNames(a, b));
}

export function serializeDeclarations(declarations: Readonly<Record<string, string>>): string {
  const sorted = sortDeclarations(declarations);
  return sorted.map(([prop, value]) => `  ${prop}: ${value};`).join('\n');
}

export function serializeRuleBlock(
  selector: string,
  declarations: Readonly<Record<string, string>>,
): string {
  if (Object.keys(declarations).length === 0) return '';
  const body = serializeDeclarations(declarations);
  return `${selector} {\n${body}\n}`;
}

export function serializeLayeredCss(
  selector: string,
  declarations: Readonly<Record<string, string>>,
  layerName = 'celestial.tokens',
): string {
  const block = serializeRuleBlock(selector, declarations);
  if (!block) return '';
  return `@layer ${layerName} {\n${block}\n}`;
}

export function buildMetadataComment(metadata: Record<string, string>): string {
  const lines = Object.entries(metadata)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  return `/* Celestial Styles ${lines.join(' ')} */`;
}

export function declarationsFromTokenMap(
  tokenDeclarations: ReadonlyArray<readonly [string, Readonly<Record<string, string>>]>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [path, subs] of tokenDeclarations) {
    if ('__single__' in subs) {
      result[tokenPathToVariableName(path)] = subs.__single__!;
    } else {
      for (const [subKey, value] of Object.entries(subs)) {
        result[tokenSubPathToVariableName(path, subKey)] = value;
      }
    }
  }
  return result;
}

export function buildSemanticDeclarations(
  semanticMap: Readonly<Record<string, string>>,
  internalVarForPath: (path: string) => string,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [alias, tokenPath] of Object.entries(semanticMap).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    result[alias] = `var(${internalVarForPath(tokenPath)})`;
  }
  return result;
}

export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeCssSelectorValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const CSP_NONCE_PATTERN = /^[A-Za-z0-9+/=_-]+$/;

export function isValidCspNonce(nonce: string): boolean {
  return CSP_NONCE_PATTERN.test(nonce);
}
