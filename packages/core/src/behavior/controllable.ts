import { coreWarn, coreError } from '../diagnostics/errors';

export interface ControllableStateOptions<T> {
  value?: T;
  defaultValue: T;
  onChange?: (value: T, previousValue: T) => void;
  isControlled?: boolean;
}

export interface ControllableStateSnapshot<T> {
  readonly value: T;
  readonly isControlled: boolean;
}

export interface ControllableState<T> {
  getSnapshot(): ControllableStateSnapshot<T>;
  subscribe(listener: () => void): () => void;
  setValue(value: T): void;
  destroy(): void;
}

export function createControllableState<T>(
  options: ControllableStateOptions<T>,
): ControllableState<T> {
  const listeners = new Set<() => void>();
  let destroyed = false;
  let isControlled = options.isControlled ?? options.value !== undefined;
  let internalValue = options.value ?? options.defaultValue;
  let warnedModeSwitch = false;

  function getValue(): T {
    if (isControlled && options.value !== undefined) {
      return options.value;
    }
    return internalValue;
  }

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    getSnapshot() {
      return { value: getValue(), isControlled };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setValue(value) {
      if (destroyed) return;
      const newControlled = options.isControlled ?? options.value !== undefined;
      if (newControlled !== isControlled && !warnedModeSwitch) {
        warnedModeSwitch = true;
        coreWarn(
          coreError(
            'CONTROLLED_MODE_SWITCH',
            'Switching between controlled and uncontrolled mode is not supported.',
            { layer: 'behavior' },
          ),
        );
      }
      isControlled = newControlled;
      const previous = getValue();
      if (isControlled) {
        options.onChange?.(value, previous);
        notify();
        return;
      }
      internalValue = value;
      options.onChange?.(value, previous);
      notify();
    },
    destroy() {
      destroyed = true;
      listeners.clear();
    },
  };
}
