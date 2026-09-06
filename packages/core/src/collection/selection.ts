import type { SelectionMode } from '../behavior/types';
import { createControllableState } from '../behavior/controllable';

export interface SelectionSnapshot<T = string> {
  readonly selected: readonly T[];
  readonly isControlled: boolean;
}

export interface SelectionOptions<T = string> {
  mode?: SelectionMode;
  value?: readonly T[];
  defaultValue?: readonly T[];
  onSelect?: (selected: readonly T[], itemId: string) => void;
}

export interface SelectionController<T = string> {
  getSnapshot(): SelectionSnapshot<T>;
  subscribe(listener: () => void): () => void;
  select(itemId: T, disabled?: boolean): void;
  isSelected(itemId: T): boolean;
  clear(): void;
  destroy(): void;
}

export function createSelection<T = string>(
  options: SelectionOptions<T> = {},
): SelectionController<T> {
  const mode = options.mode ?? 'single';
  const controllable = createControllableState<readonly T[]>({
    value: options.value,
    defaultValue: options.defaultValue ?? [],
    isControlled: options.value !== undefined,
    onChange: (selected, _prev) => {
      // onSelect called from select()
    },
  });

  return {
    getSnapshot() {
      const s = controllable.getSnapshot();
      return { selected: s.value, isControlled: s.isControlled };
    },
    subscribe: controllable.subscribe.bind(controllable),
    select(itemId, disabled) {
      if (disabled || mode === 'none') return;
      const current = controllable.getSnapshot().value;
      let next: readonly T[];
      if (mode === 'single') {
        next = [itemId];
      } else {
        const set = new Set(current);
        if (set.has(itemId)) {
          set.delete(itemId);
        } else {
          set.add(itemId);
        }
        next = [...set];
      }
      controllable.setValue(next);
      options.onSelect?.(next, itemId as unknown as string);
    },
    isSelected(itemId) {
      return controllable.getSnapshot().value.includes(itemId);
    },
    clear() {
      controllable.setValue([]);
    },
    destroy() {
      controllable.destroy();
    },
  };
}
