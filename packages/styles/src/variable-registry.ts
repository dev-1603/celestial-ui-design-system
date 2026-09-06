import type { TokenType } from '@celestial-ui/tokens';

const TOKEN_PATH_REGEX = /^(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\.(?:[a-zA-Z0-9][a-zA-Z0-9_-]*))*$/;

/** Convert a canonical token path to a `--cui-*` custom property name. */
export function tokenPathToVariableName(path: string): string {
  if (!TOKEN_PATH_REGEX.test(path)) {
    throw new Error(`Invalid token path for CSS variable: ${path}`);
  }
  return `--cui-${path.replace(/\./g, '-')}`;
}

/** Convert a token path to a composite sub-property variable name. */
export function tokenSubPathToVariableName(path: string, subKey: string): string {
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(subKey)) {
    throw new Error(`Invalid composite sub-key for CSS variable: ${subKey}`);
  }
  return `${tokenPathToVariableName(path)}-${subKey}`;
}

export function isValidTokenPath(path: string): boolean {
  return TOKEN_PATH_REGEX.test(path);
}

export const COMPOSITE_TOKEN_TYPES: ReadonlySet<TokenType> = new Set([
  'typography',
  'border',
  'stroke',
  'shadow',
  'gradient',
  'transition',
]);

export const SCALAR_TOKEN_TYPES: ReadonlySet<TokenType> = new Set([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'duration',
  'cubicBezier',
  'number',
  'strokeStyle',
]);
