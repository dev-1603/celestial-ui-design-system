import type { Token, TokenConfig } from '@celestial-ui/tokens';
import type { TokenOverride, TokenOverrideValue } from './types';

function isTokenOverride(value: TokenOverride | TokenOverrideValue): value is TokenOverride {
  return typeof value === 'object' && value !== null && '$value' in value;
}

export function normalizeOverrideValue(
  override: TokenOverride | TokenOverrideValue,
): TokenOverrideValue {
  return isTokenOverride(override) ? override.$value : override;
}

export function overrideToToken(
  override: TokenOverride | TokenOverrideValue,
  catalogToken: Token,
): Token {
  const value = normalizeOverrideValue(override);
  const explicitType = isTokenOverride(override) ? override.$type : undefined;

  return {
    ...catalogToken,
    $type: explicitType ?? catalogToken.$type,
    $value: value as Token['$value'],
  };
}

export function setTokenAtPath(config: TokenConfig, tokenPath: string, token: Token): TokenConfig {
  const parts = tokenPath.split('.');
  const result = structuredClone(config) as TokenConfig;
  let current: Record<string, unknown> = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const leafKey = parts.at(-1)!;
  current[leafKey] = token;
  return result;
}
