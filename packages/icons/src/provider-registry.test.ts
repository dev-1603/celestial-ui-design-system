import { describe, it, expect, beforeEach } from 'vitest';
import { IconProviderRegistry, registerIconProvider } from './provider-registry';
import { defaultIconProviderRegistry } from './provider-registry';
import { IconProviderRegistrationError } from './errors';
import type { IconProviderAdapter, IconVariantRequest, NormalizedIconPayload } from './types';

/** Factory for a minimal valid mock adapter */
function mockAdapter(id: string): IconProviderAdapter {
  return {
    id,
    displayName: `Test Adapter ${id}`,
    version: '1.0.0',
    catalogueSchemaVersion: '1.0.0',
    capabilities: {
      styles: ['outline'],
      weights: [],
      colorModes: ['monochrome'],
      supportsArbitrarySize: true,
      supportsSSR: true,
    },
    resolveNativeName: (name) => (name === 'search' ? 'Search' : undefined),
    canSatisfyVariant: (_v: Readonly<IconVariantRequest>) => true,
    resolve: (
      nativeName: string,
      _v: Readonly<IconVariantRequest> | undefined,
    ): NormalizedIconPayload => ({
      kind: 'svg-string',
      data: `<svg>${nativeName}</svg>`,
      nativeName,
    }),
  };
}

describe('[Unit] IconProviderRegistry', () => {
  let registry: IconProviderRegistry;

  beforeEach(() => {
    registry = new IconProviderRegistry();
  });

  it('should register a valid adapter', () => {
    registry.register(mockAdapter('lucide'));
    expect(registry.has('lucide')).toBe(true);
  });

  it('should return false for unregistered provider', () => {
    expect(registry.has('nonexistent')).toBe(false);
  });

  it('should retrieve a registered adapter by id', () => {
    const adapter = mockAdapter('fa');
    registry.register(adapter);
    expect(registry.get('fa')).toBe(adapter);
  });

  it('should throw when retrieving unregistered provider', () => {
    expect(() => registry.get('unregistered')).toThrow();
  });

  it('should throw DUPLICATE_PROVIDER_ID on duplicate registration', () => {
    registry.register(mockAdapter('lucide'));
    expect(() => registry.register(mockAdapter('lucide'))).toThrow(IconProviderRegistrationError);
  });

  it('should list all registered provider ids', () => {
    registry.register(mockAdapter('lucide'));
    registry.register(mockAdapter('fa'));
    const ids = registry.listIds();
    expect(ids).toContain('lucide');
    expect(ids).toContain('fa');
    expect(ids.length).toBe(2);
  });

  it('should throw INVALID_PROVIDER_ADAPTER for adapter missing id', () => {
    const bad = { ...mockAdapter(''), id: '' };
    expect(() => registry.register(bad)).toThrow(IconProviderRegistrationError);
  });

  it('should throw INVALID_PROVIDER_ADAPTER for adapter missing resolveNativeName', () => {
    const bad = { ...mockAdapter('lucide') };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (bad as any).resolveNativeName = undefined;
    expect(() => registry.register(bad)).toThrow(IconProviderRegistrationError);
  });

  it('should unregister a provider', () => {
    registry.register(mockAdapter('lucide'));
    registry.unregister('lucide');
    expect(registry.has('lucide')).toBe(false);
  });

  it('should clear all providers', () => {
    registry.register(mockAdapter('lucide'));
    registry.register(mockAdapter('fa'));
    registry.clear();
    expect(registry.listIds().length).toBe(0);
  });

  it('should expose contractVersion', () => {
    expect(registry.contractVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('[Unit] registerIconProvider (default registry)', () => {
  it('should delegate to the default registry', () => {
    // Use a unique id to avoid interference with other tests
    const adapter = mockAdapter('test-default-registry-provider');
    registerIconProvider(adapter);
    expect(defaultIconProviderRegistry.has('test-default-registry-provider')).toBe(true);
    defaultIconProviderRegistry.unregister('test-default-registry-provider');
  });
});
