import { Token, TokenConfig, TokenGroup } from './types';

export interface FlatTokenMap {
  [path: string]: Token;
}

export function flattenTokens(config: TokenConfig, prefix = ''): FlatTokenMap {
  const result: FlatTokenMap = {};

  for (const [key, value] of Object.entries(config)) {
    // Ignore DTCG special keys if they are somehow at this level
    if (key.startsWith('$')) continue;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    // Check if it's a Token (has $value)
    if (value && typeof value === 'object' && '$value' in value) {
      result[currentPath] = value as Token;
    } else if (value && typeof value === 'object') {
      // It's a TokenGroup
      const groupTokens = flattenTokens(value as TokenConfig, currentPath);
      Object.assign(result, groupTokens);
    }
  }

  return result;
}

const ALIAS_REGEX = /\{([^}]+)\}/g;

export function resolveAliases(flatTokens: FlatTokenMap): FlatTokenMap {
  const resolved: FlatTokenMap = {};
  const resolving = new Set<string>();

  function resolveValue(path: string, token: Token): any {
    // If we've already resolved this token, return its value
    if (resolved[path]) {
      return resolved[path].$value;
    }

    if (resolving.has(path)) {
      throw new Error(`Circular reference detected: ${[...resolving].join(' -> ')} -> ${path}`);
    }

    resolving.add(path);

    let finalValue = token.$value;

    if (typeof finalValue === 'string' && finalValue.includes('{')) {
      // Replace all `{alias}` with their actual resolved value
      finalValue = finalValue.replace(ALIAS_REGEX, (match, aliasPath) => {
        const referencedToken = flatTokens[aliasPath];
        if (!referencedToken) {
          throw new Error(`Broken reference: '${path}' references '${aliasPath}' which does not exist.`);
        }

        // Ensure layer constraint (L0 -> L1 -> L2 -> L3)
        const layerOrder = { primitive: 0, foundation: 1, semantic: 2, component: 3 };
        const myLayer = token.$extensions?.celestial?.layer;
        const refLayer = referencedToken.$extensions?.celestial?.layer;

        if (myLayer && refLayer) {
          if (layerOrder[refLayer] > layerOrder[myLayer]) {
            throw new Error(`Layer violation: [${myLayer}] '${path}' cannot reference [${refLayer}] '${aliasPath}'`);
          }
        }

        // Recursively resolve the referenced token
        return resolveValue(aliasPath, referencedToken);
      });
    } else if (Array.isArray(finalValue)) {
      finalValue = finalValue.map((item: any) => {
        if (typeof item === 'string' && item.includes('{')) {
          return item.replace(ALIAS_REGEX, (match: string, aliasPath: string) => {
            const referencedToken = flatTokens[aliasPath];
            if (!referencedToken) throw new Error(`Broken reference in array: '${path}' -> '${aliasPath}'`);
            return resolveValue(aliasPath, referencedToken);
          });
        }
        // Basic resolution for nested shadow objects if they contain string refs (simplification for V1)
        if (typeof item === 'object') {
          const newItem: any = { ...item };
          for (const k in newItem) {
            if (typeof newItem[k] === 'string' && newItem[k].includes('{')) {
              newItem[k] = newItem[k].replace(ALIAS_REGEX, (match: string, aliasPath: string) => {
                const referencedToken = flatTokens[aliasPath];
                if (!referencedToken) throw new Error(`Broken reference in composite: '${path}' -> '${aliasPath}'`);
                return resolveValue(aliasPath, referencedToken);
              });
            }
          }
          return newItem;
        }
        return item;
      }) as any;
    } else if (typeof finalValue === 'object' && finalValue !== null) {
      // Resolve composites (Typography, Border, etc.)
      const resolvedComposite: any = {};
      for (const [k, v] of Object.entries(finalValue)) {
        if (typeof v === 'string' && v.includes('{')) {
          resolvedComposite[k] = v.replace(ALIAS_REGEX, (match, aliasPath) => {
            const referencedToken = flatTokens[aliasPath];
            if (!referencedToken) throw new Error(`Broken reference in composite: '${path}' -> '${aliasPath}'`);
            return resolveValue(aliasPath, referencedToken);
          });
        } else {
          resolvedComposite[k] = v;
        }
      }
      finalValue = resolvedComposite;
    }

    resolving.delete(path);

    // Store resolved token (deep copy)
    resolved[path] = {
      ...token,
      $value: finalValue
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
