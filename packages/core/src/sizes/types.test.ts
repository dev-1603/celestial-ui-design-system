import { describe, it, expect } from 'vitest';
import { isValidSizeValue, resolveSizeValue } from './types';

describe('SizeContract helpers', () => {
  const contract = { sizes: ['sm', 'md', 'lg'], defaultSize: 'md' };

  it('validates size membership', () => {
    expect(isValidSizeValue(contract, 'md')).toBe(true);
    expect(isValidSizeValue(contract, 'xl')).toBe(false);
  });

  it('resolves default when value missing or invalid', () => {
    expect(resolveSizeValue(contract, undefined)).toBe('md');
    expect(resolveSizeValue(contract, 'sm')).toBe('sm');
    expect(resolveSizeValue(contract, 'xl')).toBe('md');
  });
});

describe('SizeContract validation via defineComponentSpec', () => {
  it('rejects invalid defaultSize', async () => {
    const { defineComponentSpec } = await import('../spec/spec');
    expect(() =>
      defineComponentSpec({
        contract: {
          id: 'badge',
          version: '1.0.0',
          schemaVersion: '1.1.0',
          sizes: { sizes: ['sm', 'md'], defaultSize: 'lg' },
        },
        metadata: { displayName: 'Badge', status: 'stable' },
      }),
    ).toThrow();
  });
});
