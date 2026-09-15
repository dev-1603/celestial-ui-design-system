import type { Token, TokenConfig, TokenLayer, TokenValue } from './types';

export interface FlatTokenMap {
  [path: string]: Token;
}

function isTokenNode(value: unknown): value is Token {
  return Boolean(value) && typeof value === 'object' && value !== null && '$value' in value;
}

export function flattenTokens(config: TokenConfig, prefix = ''): FlatTokenMap {
  const result: FlatTokenMap = {};

  for (const [key, value] of Object.entries(config)) {
    // Ignore DTCG special keys if they are somehow at this level
    if (key.startsWith('$')) continue;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (isTokenNode(value)) {
      result[currentPath] = value;
    } else if (value && typeof value === 'object') {
      const groupTokens = flattenTokens(value as TokenConfig, currentPath);
      Object.assign(result, groupTokens);
    }
  }

  return result;
}

const LAYER_ORDER: Record<TokenLayer, number> = {
  primitive: 0,
  foundation: 1,
  semantic: 2,
  component: 3,
};

/**
 * Deterministic `{alias.path}` substitution. Equivalent to `/\{([^}]+)\}/g`
 * without a regular expression: empty `{}` is not an alias, the first `}`
 * closes a match, and unmatched `{` is left as literal text.
 */
function replaceBraceAliases(input: string, replace: (aliasPath: string) => string): string {
  let result = '';
  let i = 0;
  while (i < input.length) {
    const open = input.indexOf('{', i);
    if (open === -1) {
      result += input.slice(i);
      break;
    }
    result += input.slice(i, open);
    const close = input.indexOf('}', open + 1);
    if (close === -1) {
      result += input.slice(open);
      break;
    }
    const inner = input.slice(open + 1, close);
    if (inner.length === 0) {
      result += '{}';
      i = close + 1;
      continue;
    }
    result += replace(inner);
    i = close + 1;
  }
  return result;
}

function stringifyResolvedValue(value: TokenValue): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return JSON.stringify(value);
}

function assertLayerConstraint(
  token: Token,
  referencedToken: Token,
  path: string,
  aliasPath: string,
): void {
  const myLayer = token.$extensions?.celestial?.layer;
  const refLayer = referencedToken.$extensions?.celestial?.layer;
  if (!myLayer || !refLayer) {
    return;
  }
  if (LAYER_ORDER[refLayer] > LAYER_ORDER[myLayer]) {
    throw new Error(
      `Layer violation: [${myLayer}] '${path}' cannot reference [${refLayer}] '${aliasPath}'`,
    );
  }
}

function missingReferenceMessage(
  path: string,
  aliasPath: string,
  kind: 'value' | 'array' | 'composite',
): string {
  if (kind === 'array') {
    return `Broken reference in array: '${path}' -> '${aliasPath}'`;
  }
  if (kind === 'composite') {
    return `Broken reference in composite: '${path}' -> '${aliasPath}'`;
  }
  return `Broken reference: '${path}' references '${aliasPath}' which does not exist.`;
}

export function resolveAliases(flatTokens: FlatTokenMap): FlatTokenMap {
  const resolved: FlatTokenMap = {};
  const resolving = new Set<string>();

  function resolveAliasPath(
    path: string,
    aliasPath: string,
    kind: 'value' | 'array' | 'composite',
    fromToken?: Token,
  ): string {
    const referencedToken = flatTokens[aliasPath];
    if (!referencedToken) {
      throw new Error(missingReferenceMessage(path, aliasPath, kind));
    }
    if (kind === 'value' && fromToken) {
      assertLayerConstraint(fromToken, referencedToken, path, aliasPath);
    }
    return stringifyResolvedValue(resolveValue(aliasPath, referencedToken));
  }

  function resolveCompositeRecord(
    value: Record<string, unknown>,
    path: string,
  ): Record<string, unknown> {
    const resolvedComposite: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === 'string' && v.includes('{')) {
        resolvedComposite[k] = replaceBraceAliases(v, (aliasPath) =>
          resolveAliasPath(path, aliasPath, 'composite'),
        );
      } else {
        resolvedComposite[k] = v;
      }
    }
    return resolvedComposite;
  }

  function resolveArrayValue(items: unknown[], path: string): unknown[] {
    return items.map((item) => {
      if (typeof item === 'string' && item.includes('{')) {
        return replaceBraceAliases(item, (aliasPath) => resolveAliasPath(path, aliasPath, 'array'));
      }
      if (item !== null && typeof item === 'object') {
        return resolveCompositeRecord({ ...(item as Record<string, unknown>) }, path);
      }
      return item;
    });
  }

  function resolveValue(path: string, token: Token): TokenValue {
    const already = resolved[path];
    if (already) {
      return already.$value;
    }

    if (resolving.has(path)) {
      throw new Error(`Circular reference detected: ${[...resolving].join(' -> ')} -> ${path}`);
    }

    resolving.add(path);

    let finalValue: TokenValue = token.$value;

    if (typeof finalValue === 'string' && finalValue.includes('{')) {
      finalValue = replaceBraceAliases(finalValue, (aliasPath) =>
        resolveAliasPath(path, aliasPath, 'value', token),
      );
    } else if (Array.isArray(finalValue)) {
      finalValue = resolveArrayValue(finalValue, path) as TokenValue;
    } else if (typeof finalValue === 'object' && finalValue !== null) {
      finalValue = resolveCompositeRecord(
        finalValue as unknown as Record<string, unknown>,
        path,
      ) as unknown as TokenValue;
    }

    resolving.delete(path);

    resolved[path] = {
      ...token,
      $value: finalValue,
    };

    return finalValue;
  }

  for (const [path, token] of Object.entries(flatTokens)) {
    if (!resolved[path]) {
      resolveValue(path, token);
    }
  }

  return resolved;
}
