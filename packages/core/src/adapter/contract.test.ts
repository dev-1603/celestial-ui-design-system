import { describe, it, expect } from 'vitest';
import { defineFrameworkAdapterContract, DEFAULT_ADAPTER_INTEGRATION } from './contract';
import { CORE_PACKAGE_VERSION, CONTRACT_SCHEMA_VERSION } from '../version';

describe('FrameworkAdapterContract', () => {
  it('defines immutable integration boundary defaults', () => {
    expect(DEFAULT_ADAPTER_INTEGRATION.rendering).toBe('framework-owned');
    expect(DEFAULT_ADAPTER_INTEGRATION.controlledState).toBe('adapter-translates');
  });

  it('merges partial integration overrides', () => {
    const adapter = defineFrameworkAdapterContract({
      framework: 'react',
      minCorePackage: CORE_PACKAGE_VERSION,
      minContractSchema: CONTRACT_SCHEMA_VERSION,
      supportedComponentIds: ['button'],
      integration: { rendering: 'framework-owned' },
    });
    expect(adapter.integration.lifecycle).toBe('adapter-translates');
    expect(adapter.supportedComponentIds).toEqual(['button']);
  });
});
