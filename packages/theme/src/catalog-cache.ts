import type { CanonicalTokenSources } from '@celestial-ui/tokens';
import { getCanonicalTokenSources } from '@celestial-ui/tokens';

let cachedSources: CanonicalTokenSources | undefined;

/** Returns the canonical token catalog, loading once per process. */
export function getCachedCanonicalTokenSources(): CanonicalTokenSources {
  if (!cachedSources) {
    cachedSources = getCanonicalTokenSources();
  }
  return cachedSources;
}

/** Clears the in-process catalog cache (for tests). */
export function clearCanonicalTokenSourcesCache(): void {
  cachedSources = undefined;
}
