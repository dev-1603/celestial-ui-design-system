import { describe, it, expect } from 'vitest';
import { canProviderSatisfyVariant, describeCapabilityMismatch } from './capabilities';
import type { IconProviderAdapter, IconVariantRequest, NormalizedIconPayload } from './types';

function adapter(partial: Partial<IconProviderAdapter> = {}): IconProviderAdapter {
  return {
    id: 'test',
    displayName: 'Test',
    version: '1.0.0',
    catalogueSchemaVersion: '1.0.0',
    capabilities: {
      styles: ['outline'],
      weights: ['regular'],
      colorModes: ['monochrome'],
      supportsArbitrarySize: true,
      supportsSSR: true,
    },
    resolveNativeName: () => 'X',
    canSatisfyVariant: () => true,
    resolve: (): NormalizedIconPayload => ({ kind: 'svg-string', data: '<svg/>', nativeName: 'X' }),
    ...partial,
  };
}

describe('[Unit] canProviderSatisfyVariant', () => {
  it('should accept a request with no variant', () => {
    expect(canProviderSatisfyVariant(adapter(), undefined)).toBe(true);
  });

  it('should reject an unsupported style', () => {
    expect(canProviderSatisfyVariant(adapter(), { style: 'solid' })).toBe(false);
  });

  it('should reject an unsupported weight', () => {
    expect(canProviderSatisfyVariant(adapter(), { weight: 'bold' })).toBe(false);
  });

  it('should reject an unsupported colorMode', () => {
    expect(canProviderSatisfyVariant(adapter(), { colorMode: 'multicolor' })).toBe(false);
  });

  it('should describe a weight mismatch', () => {
    const message = describeCapabilityMismatch(adapter(), { weight: 'bold' } as IconVariantRequest);
    expect(message).toContain('weight');
    expect(message).toContain('bold');
  });
});
