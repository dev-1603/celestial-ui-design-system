/**
 * Canonical icon registry.
 *
 * Loads the Celestial canonical icon vocabulary from `data/canonical.json`
 * and provides stable lookup and alias resolution.
 *
 * INVARIANTS:
 * - Read-only after initialization.
 * - No mutation of the data after the registry is created.
 * - Alias resolution always returns a canonical name (never another alias).
 */
import type { CanonicalIconName, CanonicalCatalogueFile, CanonicalCatalogueEntry } from './types';
import { iconError, IconResolutionError } from './errors';
import { validateCanonicalCatalogue } from './catalogue/validate';
import canonicalData from './data/canonical.json';

function buildAlias(entries: readonly CanonicalCatalogueEntry[]): Map<string, CanonicalIconName> {
  const map = new Map<string, CanonicalIconName>();
  for (const entry of entries) {
    map.set(entry.name, entry.name);
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        if (!map.has(alias)) {
          map.set(alias, entry.name);
        }
      }
    }
  }
  return map;
}

class CanonicalRegistry {
  private readonly _entries: ReadonlyMap<CanonicalIconName, Readonly<CanonicalCatalogueEntry>>;
  private readonly _aliases: ReadonlyMap<string, CanonicalIconName>;

  constructor(data: CanonicalCatalogueFile) {
    const result = validateCanonicalCatalogue(data);
    if (!result.isValid) {
      throw new IconResolutionError(
        `Canonical catalogue failed validation: ${result.errors[0] ?? 'unknown error'}`,
        iconError('CATALOGUE_INVALID', result.errors.join('; '), { layer: 'catalogue' }),
      );
    }

    const entries = new Map<CanonicalIconName, Readonly<CanonicalCatalogueEntry>>();
    for (const entry of data.entries) {
      entries.set(entry.name, Object.freeze({ ...entry }));
    }
    this._entries = entries;
    this._aliases = buildAlias(data.entries);
  }

  /** Returns `true` if the given name is a known canonical name (not alias). */
  has(name: CanonicalIconName): boolean {
    return this._entries.has(name);
  }

  /**
   * Resolves a name or alias to its canonical name.
   * Returns the canonical name if found, or `undefined` if unknown.
   */
  resolve(nameOrAlias: string): CanonicalIconName | undefined {
    return this._aliases.get(nameOrAlias);
  }

  /** Returns the catalogue entry for a canonical name. */
  get(name: CanonicalIconName): Readonly<CanonicalCatalogueEntry> | undefined {
    return this._entries.get(name);
  }

  /** Returns all canonical icon names. */
  list(): readonly CanonicalIconName[] {
    return [...this._entries.keys()];
  }

  /** Returns the total number of canonical icons. */
  get size(): number {
    return this._entries.size;
  }
}

/**
 * The singleton canonical registry, loaded from `data/canonical.json`.
 * Applications and framework adapters use this instance.
 * Tests may construct their own `CanonicalRegistry` instances with mock data.
 */
export const canonicalRegistry = new CanonicalRegistry(canonicalData as CanonicalCatalogueFile);

export { CanonicalRegistry };
