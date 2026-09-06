import { describe, it, expect, beforeEach } from 'vitest';
import { resolveIcon } from './resolver';
import { IconProviderRegistry } from './provider-registry';
import { CanonicalRegistry } from './canonical-registry';
import { _resetIconConfig } from './config';
import { IconResolutionError } from './errors';
import type {
  IconProviderAdapter,
  IconConfig,
  IconVariantRequest,
  NormalizedIconPayload,
  CanonicalCatalogueFile,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST_CANONICAL: CanonicalCatalogueFile = {
  schemaVersion: '1.0.0',
  updatedAt: '2026-01-01',
  entries: [
    { name: 'search', description: 'Search', category: 'action' },
    { name: 'close', description: 'Close', category: 'action' },
    { name: 'star', description: 'Star', aliases: ['favourite'], category: 'action' },
    { name: 'help', description: 'Help', category: 'status' },
  ],
};

function makeAdapter(id: string, iconMap: Record<string, string>, styles: string[] = ['outline']): IconProviderAdapter {
  return {
    id,
    displayName: `Mock ${id}`,
    version: '1.0.0',
    catalogueSchemaVersion: '1.0.0',
    capabilities: {
      styles,
      weights: [],
      colorModes: ['monochrome'],
      supportsArbitrarySize: true,
      supportsSSR: true,
    },
    resolveNativeName(canonicalName: string) {
      return iconMap[canonicalName];
    },
    canSatisfyVariant(variant: Readonly<IconVariantRequest>): boolean {
      if (variant.style && !styles.includes(variant.style)) return false;
      return true;
    },
    resolve(nativeName: string, _v: Readonly<IconVariantRequest> | undefined): NormalizedIconPayload {
      return { kind: 'svg-string', data: `<svg>${nativeName}</svg>`, nativeName };
    },
  };
}

function setup(adapters: IconProviderAdapter[], config: Partial<IconConfig> = {}) {
  const registry = new IconProviderRegistry();
  const canonical = new CanonicalRegistry(TEST_CANONICAL);
  for (const a of adapters) registry.register(a);
  const resolvedConfig: IconConfig = {
    provider: adapters[0]?.id ?? 'lucide',
    missingIconPolicy: { kind: 'empty' },
    explicitProviderPolicy: 'apply-missing-policy',
    diagnostics: false,
    ...config,
  };
  return { registry, canonical, config: resolvedConfig };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('[Unit] resolveIcon — happy path', () => {
  beforeEach(() => _resetIconConfig());

  it('should resolve a canonical name via primary provider', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const { registry, canonical, config } = setup([primary]);

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result.status).toBe('resolved');
    expect(result.canonicalName).toBe('search');
    expect(result.resolvedProviderId).toBe('lucide');
    expect(result.nativeName).toBe('Search');
    expect(result.fallbackOccurred).toBe(false);
    expect(result.payload).toBeDefined();
    expect(result.payload!.kind).toBe('svg-string');
  });

  it('should resolve an alias to its canonical form', () => {
    const primary = makeAdapter('lucide', { star: 'Star' });
    const { registry, canonical, config } = setup([primary]);

    const result = resolveIcon({ name: 'favourite' }, config, registry, canonical);

    expect(result.status).toBe('resolved');
    expect(result.canonicalName).toBe('star'); // resolved from alias
    expect(result.request.name).toBe('favourite'); // original request preserved
  });

  it('should resolve with an explicit provider override', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const explicit = makeAdapter('phosphor', { search: 'MagnifyingGlass' });
    const { registry, canonical, config } = setup([primary, explicit]);

    const result = resolveIcon({ name: 'search', provider: 'phosphor' }, config, registry, canonical);

    expect(result.status).toBe('resolved');
    expect(result.resolvedProviderId).toBe('phosphor');
    expect(result.nativeName).toBe('MagnifyingGlass');
    expect(result.fallbackOccurred).toBe(false);
  });
});

describe('[Unit] resolveIcon — missing icon', () => {
  beforeEach(() => _resetIconConfig());

  it('should return status missing when canonical name is unknown', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const { registry, canonical, config } = setup([primary]);

    const result = resolveIcon({ name: 'nonexistent-xyz-abc' }, config, registry, canonical);

    expect(result.status).toBe('missing');
    expect(result.payload).toBeNull();
    expect(result.resolvedProviderId).toBeNull();
  });

  it('should return missing when provider does not have the icon', () => {
    const primary = makeAdapter('lucide', {}); // no icons
    const { registry, canonical, config } = setup([primary]);

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result.status).toBe('missing');
    expect(result.payload).toBeNull();
  });

  it('should apply missingIconPolicy: error by throwing', () => {
    const primary = makeAdapter('lucide', {});
    const { registry, canonical, config } = setup([primary], {
      missingIconPolicy: { kind: 'error' },
    });

    expect(() => resolveIcon({ name: 'search' }, config, registry, canonical)).toThrow(
      IconResolutionError,
    );
  });

  it('should apply missingIconPolicy: fallback-icon by re-resolving', () => {
    const primary = makeAdapter('lucide', { help: 'Help' }); // 'search' not mapped, 'help' is
    const { registry, canonical, config } = setup([primary], {
      missingIconPolicy: { kind: 'fallback-icon', canonicalName: 'help' },
    });

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    // Should have resolved 'help' as the fallback
    expect(result.status).toBe('resolved');
    expect(result.canonicalName).toBe('help');
  });

  it('should not recurse infinitely when fallback-icon also fails', () => {
    const primary = makeAdapter('lucide', {}); // no icons
    const { registry, canonical, config } = setup([primary], {
      missingIconPolicy: { kind: 'fallback-icon', canonicalName: 'search' }, // same as failed icon
    });

    // Should return empty, not recurse
    const result = resolveIcon({ name: 'search' }, config, registry, canonical);
    expect(result.status).toBe('missing');
  });
});

describe('[Unit] resolveIcon — fallback chain', () => {
  beforeEach(() => _resetIconConfig());

  it('should fall through to fallback provider when primary fails', () => {
    const primary = makeAdapter('lucide', {}); // no icons
    const fallback = makeAdapter('phosphor', { search: 'MagnifyingGlass' });
    const { registry, canonical, config } = setup([primary, fallback], {
      provider: 'lucide',
      fallback: ['phosphor'],
    });

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result.status).toBe('resolved-via-fallback');
    expect(result.fallbackOccurred).toBe(true);
    expect(result.resolvedProviderId).toBe('phosphor');
  });

  it('should try fallbacks in order and use first successful one', () => {
    const primary = makeAdapter('lucide', {});
    const fallback1 = makeAdapter('fa', {}); // also no icons
    const fallback2 = makeAdapter('phosphor', { search: 'MagnifyingGlass' });
    const { registry, canonical, config } = setup([primary, fallback1, fallback2], {
      provider: 'lucide',
      fallback: ['fa', 'phosphor'],
    });

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result.status).toBe('resolved-via-fallback');
    expect(result.resolvedProviderId).toBe('phosphor');
  });

  it('should return missing when all fallbacks are exhausted', () => {
    const primary = makeAdapter('lucide', {});
    const fallback1 = makeAdapter('fa', {});
    const { registry, canonical, config } = setup([primary, fallback1], {
      provider: 'lucide',
      fallback: ['fa'],
    });

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result.status).toBe('missing');
  });
});

describe('[Unit] resolveIcon — explicit provider failure', () => {
  beforeEach(() => _resetIconConfig());

  it('should NOT auto-fallback when explicit provider fails (default policy)', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const explicit = makeAdapter('phosphor', {}); // phosphor has no icons
    const { registry, canonical, config } = setup([primary, explicit], {
      provider: 'lucide',
      fallback: ['lucide'],
      explicitProviderPolicy: 'apply-missing-policy',
    });

    const result = resolveIcon({ name: 'search', provider: 'phosphor' }, config, registry, canonical);

    // Should NOT fall through to lucide even though lucide is in fallback
    expect(result.status).toBe('missing');
    expect(result.resolvedProviderId).toBeNull();
  });

  it('should allow fallback when explicitProviderPolicy is allow-fallback', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const explicit = makeAdapter('phosphor', {}); // no icons
    const { registry, canonical, config } = setup([primary, explicit], {
      provider: 'lucide',
      fallback: ['lucide'],
      explicitProviderPolicy: 'allow-fallback',
    });

    const result = resolveIcon({ name: 'search', provider: 'phosphor' }, config, registry, canonical);

    expect(result.status).toBe('resolved-via-fallback');
    expect(result.resolvedProviderId).toBe('lucide');
  });

  it('should return missing when explicit provider is not registered', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const { registry, canonical, config } = setup([primary]);

    const result = resolveIcon({ name: 'search', provider: 'unregistered' }, config, registry, canonical);

    expect(result.status).toBe('missing');
  });
});

describe('[Unit] resolveIcon — variant handling', () => {
  beforeEach(() => _resetIconConfig());

  it('should skip provider that cannot satisfy variant', () => {
    const outlineOnly = makeAdapter('lucide', { search: 'Search' }, ['outline']);
    const solidCapable = makeAdapter('fa', { search: 'magnifying-glass' }, ['solid', 'regular']);
    const { registry, canonical, config } = setup([outlineOnly, solidCapable], {
      provider: 'lucide',
      fallback: ['fa'],
    });

    const result = resolveIcon(
      { name: 'search', variant: { style: 'solid' } },
      config,
      registry,
      canonical,
    );

    expect(result.status).toBe('resolved-via-fallback');
    expect(result.resolvedProviderId).toBe('fa');
  });
});

describe('[Unit] resolveIcon — diagnostics', () => {
  beforeEach(() => _resetIconConfig());

  it('should include diagnostics when config.diagnostics: true and resolution fails', () => {
    const primary = makeAdapter('lucide', {});
    const { registry, canonical, config } = setup([primary], { diagnostics: true });

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result.diagnostics).toBeDefined();
    expect(result.diagnostics!.triedProviders).toContain('lucide');
    expect(result.diagnostics!.reason).toBeTruthy();
  });

  it('should not include diagnostics when config.diagnostics: false', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const { registry, canonical, config } = setup([primary], { diagnostics: false });

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result.diagnostics).toBeUndefined();
  });

  it('should attach diagnostics on missing even when diagnostics is false', () => {
    const primary = makeAdapter('lucide', {});
    const { registry, canonical, config } = setup([primary], { diagnostics: false });

    const result = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result.status).toBe('missing');
    expect(result.diagnostics).toBeDefined();
    expect(result.diagnostics!.triedProviders).toContain('lucide');
  });
});

describe('[Unit] resolveIcon — request validation', () => {
  beforeEach(() => _resetIconConfig());

  it('should throw on empty icon name', () => {
    const primary = makeAdapter('lucide', {});
    const { registry, canonical, config } = setup([primary]);

    expect(() => resolveIcon({ name: '' }, config, registry, canonical)).toThrow(
      IconResolutionError,
    );
  });

  it('should throw on icon name with uppercase letters', () => {
    const primary = makeAdapter('lucide', {});
    const { registry, canonical, config } = setup([primary]);

    expect(() => resolveIcon({ name: 'Search' }, config, registry, canonical)).toThrow(
      IconResolutionError,
    );
  });

  it('should throw on icon name with spaces', () => {
    const primary = makeAdapter('lucide', {});
    const { registry, canonical, config } = setup([primary]);

    expect(() => resolveIcon({ name: 'bad name' }, config, registry, canonical)).toThrow(
      IconResolutionError,
    );
  });

  it('should throw on invalid explicit provider id format', () => {
    const primary = makeAdapter('lucide', {});
    const { registry, canonical, config } = setup([primary]);

    expect(() =>
      resolveIcon({ name: 'search', provider: 'bad provider!' }, config, registry, canonical),
    ).toThrow(IconResolutionError);
  });
});

describe('[Unit] resolveIcon — unknown canonical + missing policy', () => {
  beforeEach(() => _resetIconConfig());

  it('should throw when the name is unknown and missingIconPolicy is error', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const { registry, canonical, config } = setup([primary], {
      missingIconPolicy: { kind: 'error' },
    });

    expect(() => resolveIcon({ name: 'nonexistent-xyz-abc' }, config, registry, canonical)).toThrow(
      IconResolutionError,
    );
  });

  it('should honor ResolveIconOptions as the third argument', () => {
    const primary = makeAdapter('lucide', { search: 'Search' });
    const { registry, canonical, config } = setup([primary]);

    const result = resolveIcon({ name: 'search' }, config, {
      registry,
      canonicalRegistry: canonical,
    });

    expect(result.status).toBe('resolved');
    expect(result.resolvedProviderId).toBe('lucide');
  });
});
