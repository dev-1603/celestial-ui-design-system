import type { TokenConfig } from './types';
import {
  CANONICAL_COMPONENTS,
  CANONICAL_DARK,
  CANONICAL_FOUNDATIONS,
  CANONICAL_LIGHT,
  CANONICAL_PRIMITIVES,
} from './generated/canonical-sources';

export interface CanonicalTokenSources {
  primitives: TokenConfig;
  foundations: TokenConfig;
  components: TokenConfig;
  modes: {
    light: TokenConfig;
    dark: TokenConfig;
  };
}

/**
 * Returns the unresolved canonical token catalog (same layers as `data/`).
 * Safe to call from Node, Bun, and SSR. Browser bundles should still prefer
 * CSS exports; importing this name embeds the catalog JSON.
 */
export function getCanonicalTokenSources(): CanonicalTokenSources {
  return {
    primitives: CANONICAL_PRIMITIVES,
    foundations: CANONICAL_FOUNDATIONS,
    components: CANONICAL_COMPONENTS,
    modes: {
      light: CANONICAL_LIGHT,
      dark: CANONICAL_DARK,
    },
  };
}

/** Merges catalog layers with a mode overlay into a single unresolved TokenConfig. */
export function buildTokenConfigForMode(
  sources: CanonicalTokenSources,
  mode: 'light' | 'dark',
): TokenConfig {
  return {
    ...sources.primitives,
    ...sources.foundations,
    ...sources.components,
    ...sources.modes[mode],
  };
}
