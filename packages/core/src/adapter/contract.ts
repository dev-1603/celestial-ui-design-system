import type { ComponentId } from '../ids';
import type { CelestialRuntime } from '../runtime/types';

/**
 * Immutable integration boundary between Core (WHAT) and framework adapters (HOW).
 *
 * Core defines this contract only. Framework packages implement it elsewhere.
 */
export interface AdapterIntegrationBoundary {
  /** Rendering is always owned by the framework component library. */
  readonly rendering: 'framework-owned';
  /** Lifecycle hooks/composables are translated by the adapter. */
  readonly lifecycle: 'adapter-translates';
  /** Ref exposure follows Core RefContract via adapter translation. */
  readonly refs: 'adapter-translates';
  /** Semantic events are translated to framework event APIs. */
  readonly events: 'adapter-translates';
  /** Controlled/uncontrolled state follows Core controllers via adapter. */
  readonly controlledState: 'adapter-translates';
  /** Pointer/keyboard/focus semantics are preserved; binding is adapter-owned. */
  readonly interaction: 'adapter-preserves-semantics';
}

export interface FrameworkAdapterContract {
  readonly framework: string;
  readonly frameworkVersion?: string;
  readonly minCorePackage: string;
  readonly minContractSchema: string;
  readonly minSpecSchema?: string;
  readonly supportedComponentIds?: readonly ComponentId[];
  readonly integration: AdapterIntegrationBoundary;
}

export interface AdapterRenderContext {
  readonly runtime: CelestialRuntime;
  readonly componentId: ComponentId;
}

export const DEFAULT_ADAPTER_INTEGRATION: AdapterIntegrationBoundary = {
  rendering: 'framework-owned',
  lifecycle: 'adapter-translates',
  refs: 'adapter-translates',
  events: 'adapter-translates',
  controlledState: 'adapter-translates',
  interaction: 'adapter-preserves-semantics',
};

export function defineFrameworkAdapterContract(
  input: Omit<FrameworkAdapterContract, 'integration'> & {
    integration?: Partial<AdapterIntegrationBoundary>;
  },
): FrameworkAdapterContract {
  return {
    ...input,
    integration: {
      ...DEFAULT_ADAPTER_INTEGRATION,
      ...input.integration,
    },
  };
}
