import type { Token, TokenType } from '@celestial-ui/tokens';
import { styleError } from './errors';
import type { StyleError } from './errors';
import { COMPOSITE_TOKEN_TYPES } from './variable-registry';

const ALIAS_PATTERN = /\{[^}]+\}/;
const UNSAFE_CSS_PATTERN = /[;{}]|\/\*|<\/style|javascript:|expression\s*\(/i;
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;

export interface FormattedDeclarations {
  [propertyName: string]: string;
}

function assertSafeCssString(value: string, path: string): void {
  if (CONTROL_CHAR_PATTERN.test(value)) {
    throw styleError('INVALID_CSS_VALUE', `Control characters in CSS value at ${path}`, { path });
  }
  if (UNSAFE_CSS_PATTERN.test(value)) {
    throw styleError('INVALID_CSS_VALUE', `Unsafe CSS value at ${path}`, { path });
  }
}

function assertNoAlias(value: string, path: string): void {
  if (ALIAS_PATTERN.test(value)) {
    throw styleError('UNRESOLVED_ALIAS', `Unresolved alias in resolved theme at ${path}`, { path });
  }
}

function formatScalar(value: string | number, path: string, tokenType: TokenType): string {
  if (value === null || value === undefined) {
    throw styleError('INVALID_CSS_VALUE', `Null/undefined value at ${path}`, { path, tokenType });
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw styleError('INVALID_CSS_VALUE', `Non-finite number at ${path}`, { path, tokenType });
    }
    return String(value);
  }
  assertNoAlias(value, path);
  assertSafeCssString(value, path);
  return value;
}

function formatShadowLayer(shadow: Record<string, unknown>): string {
  const inset = shadow.inset ? 'inset ' : '';
  const offsetX = String(shadow.offsetX ?? '0');
  const offsetY = String(shadow.offsetY ?? '0');
  const blur = String(shadow.blur ?? '0');
  const spread = String(shadow.spread ?? '0');
  const color = String(shadow.color ?? 'transparent');
  return `${inset}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
}

function formatShadowValue(value: unknown, path: string): string {
  if (Array.isArray(value)) {
    const layers = value.map((layer, i) => {
      if (typeof layer !== 'object' || layer === null) {
        throw styleError('INVALID_CSS_VALUE', `Invalid shadow layer at ${path}[${i}]`, { path });
      }
      return formatShadowLayer(layer as Record<string, unknown>);
    });
    const result = layers.join(', ');
    assertSafeCssString(result, path);
    return result;
  }
  if (typeof value === 'object' && value !== null) {
    const result = formatShadowLayer(value as Record<string, unknown>);
    assertSafeCssString(result, path);
    return result;
  }
  throw styleError('INVALID_CSS_VALUE', `Invalid shadow value at ${path}`, { path, tokenType: 'shadow' });
}

function formatBorderValue(value: Record<string, unknown>, path: string): string {
  const width = String(value.width ?? '0');
  const style = String(value.style ?? 'solid');
  const color = String(value.color ?? 'transparent');
  const result = `${width} ${style} ${color}`;
  assertNoAlias(result, path);
  assertSafeCssString(result, path);
  return result;
}

function formatTypographySubProperties(
  value: Record<string, unknown>,
  path: string,
): FormattedDeclarations {
  const result: FormattedDeclarations = {};
  const allowed = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'] as const;
  for (const key of allowed) {
    if (key in value && value[key] !== undefined) {
      const subPath = `${path}.${key}`;
      result[key] = formatScalar(value[key] as string | number, subPath, 'typography');
    }
  }
  return result;
}

function formatTransitionValue(value: unknown, path: string): string {
  if (Array.isArray(value)) {
    const parts = value.map((item, i) => {
      if (typeof item !== 'object' || item === null) {
        throw styleError('INVALID_CSS_VALUE', `Invalid transition item at ${path}[${i}]`, { path });
      }
      const t = item as Record<string, unknown>;
      const duration = String(t.duration ?? '0s');
      const timing = String(t.timingFunction ?? 'ease');
      const delay = t.delay !== undefined ? ` ${t.delay}` : '';
      const property = String(t.property ?? 'all');
      return `${property} ${duration} ${timing}${delay}`;
    });
    const result = parts.join(', ');
    assertSafeCssString(result, path);
    return result;
  }
  if (typeof value === 'object' && value !== null) {
    const t = value as Record<string, unknown>;
    const duration = String(t.duration ?? '0s');
    const timing = String(t.timingFunction ?? 'ease');
    const delay = t.delay !== undefined ? ` ${t.delay}` : '';
    const property = String(t.property ?? 'all');
    const result = `${property} ${duration} ${timing}${delay}`;
    assertSafeCssString(result, path);
    return result;
  }
  throw styleError('INVALID_CSS_VALUE', `Invalid transition at ${path}`, { path, tokenType: 'transition' });
}

function formatGradientValue(value: unknown, path: string): string {
  if (typeof value === 'string') {
    assertNoAlias(value, path);
    assertSafeCssString(value, path);
    return value;
  }
  if (Array.isArray(value)) {
    const stops = value
      .map((stop) => {
        if (typeof stop !== 'object' || stop === null) return String(stop);
        const s = stop as Record<string, unknown>;
        return `${s.color ?? 'transparent'} ${s.position ?? '0%'}`;
      })
      .join(', ');
    const result = `linear-gradient(${stops})`;
    assertSafeCssString(result, path);
    return result;
  }
  throw styleError('INVALID_CSS_VALUE', `Invalid gradient at ${path}`, { path, tokenType: 'gradient' });
}

function formatCubicBezier(value: unknown, path: string): string {
  if (!Array.isArray(value) || value.length !== 4) {
    throw styleError('INVALID_CSS_VALUE', `cubicBezier requires 4 numbers at ${path}`, {
      path,
      tokenType: 'cubicBezier',
    });
  }
  for (const n of value) {
    if (typeof n !== 'number' || !Number.isFinite(n)) {
      throw styleError('INVALID_CSS_VALUE', `Invalid cubicBezier number at ${path}`, {
        path,
        tokenType: 'cubicBezier',
      });
    }
  }
  return `cubic-bezier(${value.join(', ')})`;
}

/**
 * Format a resolved token into one or more CSS custom property declarations.
 */
export function formatTokenDeclarations(
  path: string,
  token: Token,
): FormattedDeclarations {
  const { $type, $value } = token;

  if ($value === null || $value === undefined) {
    throw styleError('INVALID_CSS_VALUE', `Null token value at ${path}`, { path, tokenType: $type });
  }

  if (typeof $value === 'string' && ALIAS_PATTERN.test($value)) {
    throw styleError('UNRESOLVED_ALIAS', `Unresolved alias at ${path}: ${$value}`, { path, tokenType: $type });
  }

  if ($type === 'shadow') {
    return { __single__: formatShadowValue($value, path) };
  }

  if ($type === 'typography' && typeof $value === 'object' && !Array.isArray($value)) {
    return formatTypographySubProperties($value as unknown as Record<string, unknown>, path);
  }

  if ($type === 'border' || $type === 'stroke') {
    if (typeof $value === 'object' && !Array.isArray($value)) {
      return { __single__: formatBorderValue($value as unknown as Record<string, unknown>, path) };
    }
  }

  if ($type === 'transition') {
    return { __single__: formatTransitionValue($value, path) };
  }

  if ($type === 'gradient') {
    return { __single__: formatGradientValue($value, path) };
  }

  if ($type === 'cubicBezier') {
    return { __single__: formatCubicBezier($value, path) };
  }

  if (typeof $value === 'object' && !Array.isArray($value)) {
    if (COMPOSITE_TOKEN_TYPES.has($type)) {
      const subs: FormattedDeclarations = {};
      for (const [subKey, subValue] of Object.entries($value)) {
        if (typeof subValue === 'string' || typeof subValue === 'number') {
          subs[subKey] = formatScalar(subValue, `${path}.${subKey}`, $type);
        }
      }
      if (Object.keys(subs).length > 0) return subs;
    }
    throw styleError('UNSUPPORTED_TOKEN_TYPE', `Cannot format composite object at ${path}`, {
      path,
      tokenType: $type,
    });
  }

  if (Array.isArray($value)) {
    throw styleError('UNSUPPORTED_TOKEN_TYPE', `Unsupported array token at ${path}`, {
      path,
      tokenType: $type,
    });
  }

  return { __single__: formatScalar($value as string | number, path, $type) };
}

export function collectStyleErrors(fn: () => void): StyleError[] {
  try {
    fn();
    return [];
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err) {
      return [err as StyleError];
    }
    throw err;
  }
}
