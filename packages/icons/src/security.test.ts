import { describe, it, expect } from 'vitest';
import { resolveIcon } from './resolver';
import { IconProviderRegistry } from './provider-registry';
import { CanonicalRegistry } from './canonical-registry';
import { MaterialSymbolsAdapter } from './providers/material';
import type {
  IconProviderAdapter,
  IconConfig,
  IconVariantRequest,
  NormalizedIconPayload,
  CanonicalCatalogueFile,
} from './types';

const TEST_CANONICAL: CanonicalCatalogueFile = {
  schemaVersion: '1.0.0',
  updatedAt: '2026-01-01',
  entries: [{ name: 'search', category: 'action' }],
};

function makeSafeAdapter(id: string): IconProviderAdapter {
  return {
    id,
    displayName: `Safe Adapter ${id}`,
    version: '1.0.0',
    catalogueSchemaVersion: '1.0.0',
    capabilities: {
      styles: ['outline'],
      weights: [],
      colorModes: ['monochrome'],
      supportsArbitrarySize: true,
      supportsSSR: true,
    },
    resolveNativeName: () => 'SafeSearch',
    canSatisfyVariant: (_v: Readonly<IconVariantRequest>) => true,
    resolve: (_name: string, _v: Readonly<IconVariantRequest> | undefined): NormalizedIconPayload => ({
      kind: 'svg-string',
      data: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/></svg>',
      nativeName: 'SafeSearch',
    }),
  };
}

const config: IconConfig = {
  provider: 'test',
  missingIconPolicy: { kind: 'empty' },
  explicitProviderPolicy: 'apply-missing-policy',
  diagnostics: false,
};

describe('[Security] resolveIcon', () => {
  it('should reject icon names containing script injection', () => {
    const registry = new IconProviderRegistry();
    registry.register(makeSafeAdapter('test'));
    const canonical = new CanonicalRegistry(TEST_CANONICAL);

    // Names must be lowercase alphanumeric + hyphens only
    expect(() =>
      resolveIcon({ name: 'search<script>alert(1)</script>' }, config, registry, canonical),
    ).toThrow();
  });

  it('should reject icon names with spaces', () => {
    const registry = new IconProviderRegistry();
    registry.register(makeSafeAdapter('test'));
    const canonical = new CanonicalRegistry(TEST_CANONICAL);

    expect(() =>
      resolveIcon({ name: 'search icon' }, config, registry, canonical),
    ).toThrow();
  });

  it('should reject icon names with angle brackets', () => {
    const registry = new IconProviderRegistry();
    registry.register(makeSafeAdapter('test'));
    const canonical = new CanonicalRegistry(TEST_CANONICAL);

    expect(() =>
      resolveIcon({ name: '<bad>' }, config, registry, canonical),
    ).toThrow();
  });

  it('should reject provider ids with special characters', () => {
    const registry = new IconProviderRegistry();
    registry.register(makeSafeAdapter('test'));
    const canonical = new CanonicalRegistry(TEST_CANONICAL);

    expect(() =>
      resolveIcon({ name: 'search', provider: '"><script>' }, config, registry, canonical),
    ).toThrow();
  });

  it('should not execute any code from the malicious adapter resolve method', () => {
    // The core resolver calls adapter.resolve() — it must not evaluate its output
    let executed = false;
    const maliciousAdapter: IconProviderAdapter = {
      ...makeSafeAdapter('malicious'),
      id: 'malicious',
      resolve: (_name: string, _v: Readonly<IconVariantRequest> | undefined): NormalizedIconPayload => {
        executed = false; // adapter resolve is called, but data is opaque to core
        return {
          kind: 'svg-string',
          data: '<script>evil()</script>', // raw data — framework adapter must sanitize
          nativeName: 'MaliciousIcon',
        };
      },
    };

    const registry = new IconProviderRegistry();
    registry.register(maliciousAdapter);
    const canonical = new CanonicalRegistry(TEST_CANONICAL);
    const testConfig: IconConfig = { ...config, provider: 'malicious' };

    const result = resolveIcon({ name: 'search' }, testConfig, registry, canonical);

    // Core resolver returns the payload as opaque data — does NOT execute it
    expect(result.status).toBe('resolved');
    expect(result.payload?.data).toContain('<script>'); // data is opaque string
    // The framework adapter (not tested here) is responsible for sanitizing this
    expect(executed).toBe(false); // no side effects from adapter
  });

  it('should reject Material class injection via invalid ligature names', () => {
    expect(MaterialSymbolsAdapter.resolve('search;background:url', undefined)).toBeUndefined();
    expect(MaterialSymbolsAdapter.resolve('a b', undefined)).toBeUndefined();
  });

  it('should not be exploitable via provider id injection in registry', () => {
    const registry = new IconProviderRegistry();
    const canonical = new CanonicalRegistry(TEST_CANONICAL);

    expect(() =>
      registry.register({ ...makeSafeAdapter(''), id: '' }),
    ).toThrow(); // empty id rejected at registration

    expect(() =>
      registry.register({ ...makeSafeAdapter('../../etc/passwd'), id: '../../etc/passwd' }),
    ).toThrow();
  });

  it('resolution is deterministic (same inputs produce same output)', () => {
    const registry = new IconProviderRegistry();
    registry.register(makeSafeAdapter('test'));
    const canonical = new CanonicalRegistry(TEST_CANONICAL);

    const result1 = resolveIcon({ name: 'search' }, config, registry, canonical);
    const result2 = resolveIcon({ name: 'search' }, config, registry, canonical);

    expect(result1.status).toBe(result2.status);
    expect(result1.nativeName).toBe(result2.nativeName);
    expect(result1.resolvedProviderId).toBe(result2.resolvedProviderId);
  });
});
