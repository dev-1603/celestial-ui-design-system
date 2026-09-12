import { describe, it, expect } from 'vitest';
import { assertSpecValid, createContractHarness, assertKeyboardIntent } from '../testing/index';
import { defineComponentSpec } from '../spec/spec';
import { CONTRACT_SCHEMA_VERSION } from '../version';

describe('contract testing utilities', () => {
  it('assertSpecValid passes for valid spec', () => {
    const spec = defineComponentSpec({
      contract: {
        id: 'dialog',
        version: '1.0.0',
        schemaVersion: CONTRACT_SCHEMA_VERSION,
        overlay: { modal: true, dismissOnEscape: true },
        accessibility: { role: 'dialog' },
      },
      metadata: { displayName: 'Dialog', status: 'stable' },
    });
    const harness = createContractHarness(spec);
    harness.assertValid();
    assertSpecValid(spec);
  });

  it('assertKeyboardIntent validates key mapping', () => {
    assertKeyboardIntent('ArrowDown', 'next');
    assertKeyboardIntent('Escape', 'dismiss');
  });
});
