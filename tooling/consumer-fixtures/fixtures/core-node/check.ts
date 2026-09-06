import {
  CONTRACT_SCHEMA_VERSION,
  createCelestialRuntime,
  createDisclosure,
  createNullEnvironment,
  defineComponentSpec,
} from '@celestial-ui/core';
import { createContractHarness } from '@celestial-ui/core/testing';

const spec = defineComponentSpec({
  contract: {
    id: 'consumer-check',
    version: '1.0.0',
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    states: { allowed: ['idle'] },
    parts: { parts: { root: { name: 'root', required: true } } },
  },
  metadata: { displayName: 'Consumer Check', status: 'stable' },
});

const harness = createContractHarness(spec);
harness.assertValid();

const runtime = createCelestialRuntime({
  environment: createNullEnvironment(),
});
const disclosure = createDisclosure({ defaultOpen: false });
if (disclosure.getSnapshot().open !== false) {
  throw new Error('disclosure defaultOpen failed');
}

console.log('core-node consumer OK');
