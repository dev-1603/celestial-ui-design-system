import { describe, it, expect } from 'vitest';
import {
  buildTokenConfigForMode,
  flattenTokens,
  getCanonicalTokenSources,
  resolveAliases,
  validateTokens,
} from '@celestial-ui/tokens';
import { createThemeRegistry, resolveTheme, CELESTIAL_THEME } from './index';

describe('Integration with @celestial-ui/tokens', () => {
  it('loads catalog and resolves tokens through the public tokens API', () => {
    const sources = getCanonicalTokenSources();
    const config = buildTokenConfigForMode(sources, 'light');
    const validation = validateTokens(config);
    const resolved = resolveAliases(flattenTokens(config));

    expect(validation.isValid).toBe(true);
    expect(resolved['text.primary']?.$value).toBeDefined();
  });

  it('resolveTheme produces the same token graph as tokens for celestial with no overrides', () => {
    const sources = getCanonicalTokenSources();
    const direct = resolveAliases(flattenTokens(buildTokenConfigForMode(sources, 'light')));

    const registry = createThemeRegistry([CELESTIAL_THEME]);
    const themed = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });

    expect(themed.validation.isValid).toBe(true);
    expect(themed.tokens).toEqual(direct);
  });
});
