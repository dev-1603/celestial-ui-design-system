import { coreWarn, coreError } from '../diagnostics/errors';

const FORBIDDEN_FORWARD = new Set(['as', 'children', 'spec', 'contract', 'controller', 'runtime']);

export interface ForwardedPropsInput {
  readonly componentProps?: Record<string, unknown>;
  readonly nativeProps?: Record<string, unknown>;
  readonly generatedA11y?: Record<string, unknown>;
  readonly generatedState?: Record<string, unknown>;
}

export function mergeForwardedProps(input: ForwardedPropsInput): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function merge(source: Record<string, unknown> | undefined, priority: number): void {
    if (!source) return;
    for (const [key, value] of Object.entries(source)) {
      if (FORBIDDEN_FORWARD.has(key)) continue;
      if (value === undefined) continue;
      const existing = result[key];
      if (existing === undefined) {
        result[key] = value;
        return;
      }
      // Higher priority overwrites — order applied below
      void priority;
      result[key] = value;
    }
  }

  merge(input.nativeProps, 1);
  merge(input.componentProps, 2);
  merge(input.generatedState, 3);
  merge(input.generatedA11y, 4);

  // aria-label: consumer wins if non-empty
  const consumerLabel = input.nativeProps?.['aria-label'] ?? input.componentProps?.['aria-label'];
  if (consumerLabel) {
    result['aria-label'] = consumerLabel;
  }

  return result;
}

export function warnOnForbiddenProp(key: string): void {
  if (FORBIDDEN_FORWARD.has(key)) {
    coreWarn(
      coreError('INVALID_CONTRACT', `Prop "${key}" cannot be forwarded to DOM.`, {
        layer: 'contract',
      }),
    );
  }
}
