import { describe, it, expect } from 'vitest';
import { assertSpecValid, createContractHarness, assertKeyboardIntent } from '../testing/index';
import { defineComponentSpec } from '../spec/spec';
import { CONTRACT_SCHEMA_VERSION } from '../version';

describe('contract testing utilities', () => {
  it('assertSpecValid passes for valid spec', () => {
    const spec = defineComponentSpec({
      contract: {
        id: 'aspect-ratio',
        version: '1.0.0',
        schemaVersion: CONTRACT_SCHEMA_VERSION,
        overlay: { modal: true, dismissOnEscape: true },
        accessibility: { role: 'img' },
      },
      metadata: { displayName: 'Aspect Ratio', status: 'stable' },
    });
    const harness = createContractHarness(spec);
    expect(() => harness.assertValid()).not.toThrow();
    expect(() => assertSpecValid(spec)).not.toThrow();
    expect(spec.contract.id).toBe('aspect-ratio');
  });

  it('assertKeyboardIntent validates key mapping', () => {
    expect(() => assertKeyboardIntent('ArrowDown', 'next')).not.toThrow();
    expect(() => assertKeyboardIntent('Escape', 'dismiss')).not.toThrow();
  });
});
