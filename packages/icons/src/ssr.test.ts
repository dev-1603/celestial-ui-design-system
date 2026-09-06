import { describe, it, expect } from 'vitest';
import { resolveIcon } from './resolver';
import { IconProviderRegistry } from './provider-registry';
import { canonicalRegistry } from './canonical-registry';
import { LucideAdapter } from './providers/lucide';
import { createIconifyAdapter } from './providers/iconify';
import type { IconConfig } from './types';

const baseConfig: IconConfig = {
  provider: 'lucide',
  missingIconPolicy: { kind: 'empty' },
  explicitProviderPolicy: 'apply-missing-policy',
  diagnostics: true,
};

describe('[SSR] independent resolution contexts', () => {
  it('should resolve with two isolated registries and configs without sharing adapters', () => {
    const registryA = new IconProviderRegistry();
    const registryB = new IconProviderRegistry();
    registryA.register(LucideAdapter);

    const configA: IconConfig = { ...baseConfig, provider: 'lucide' };
    const configB: IconConfig = { ...baseConfig, provider: 'fa' };

    const a = resolveIcon({ name: 'search' }, configA, {
      registry: registryA,
      canonicalRegistry,
    });
    const b = resolveIcon({ name: 'search' }, configB, {
      registry: registryB,
      canonicalRegistry,
    });

    expect(a.status).toBe('resolved');
    expect(a.resolvedProviderId).toBe('lucide');
    expect(b.status).toBe('missing');
    expect(b.resolvedProviderId).toBeNull();
  });

  it('should keep Iconify collection overrides isolated per adapter instance', () => {
    const mdi = createIconifyAdapter({ collection: 'mdi' });
    const tabler = createIconifyAdapter({ collection: 'tabler' });
    expect(mdi.resolveNativeName('search')).toBe('mdi:magnifying-glass');
    expect(tabler.resolveNativeName('search')).toBe('tabler:magnifying-glass');
    expect(mdi.resolveNativeName('search')).toBe('mdi:magnifying-glass');
  });
});
