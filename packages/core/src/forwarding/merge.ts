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

  // Later merge() calls overwrite earlier keys. Call order is the priority.
  function merge(source: Record<string, unknown> | undefined): void {
    if (!source) return;
    for (const [key, value] of Object.entries(source)) {
      if (FORBIDDEN_FORWARD.has(key)) continue;
      if (value === undefined) continue;
      result[key] = value;
    }
  }

  merge(input.nativeProps);
  merge(input.componentProps);
  merge(input.generatedState);
  merge(input.generatedA11y);

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
