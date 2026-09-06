import * as fs from 'fs';
import * as path from 'path';
import { TokenConfig } from './types';

export interface CanonicalTokenSources {
  primitives: TokenConfig;
  foundations: TokenConfig;
  components: TokenConfig;
  modes: {
    light: TokenConfig;
    dark: TokenConfig;
  };
}

function getDataDir(): string {
  return path.resolve(__dirname, '../data');
}

function readJsonConfig(relativePath: string): TokenConfig {
  const filePath = path.join(getDataDir(), relativePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as TokenConfig;
}

/**
 * Loads the unresolved canonical token catalog from package data files.
 * Intended for Node/build usage (same source as the tokens build script).
 */
export function getCanonicalTokenSources(): CanonicalTokenSources {
  return {
    primitives: readJsonConfig('primitives.json'),
    foundations: readJsonConfig('foundations.json'),
    components: readJsonConfig('components.json'),
    modes: {
      light: readJsonConfig('themes/celestial/light.json'),
      dark: readJsonConfig('themes/celestial/dark.json'),
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
