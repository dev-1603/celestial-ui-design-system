import type { OpenChangeReason } from '../events/types';
import { createCancellableEvent } from '../events/types';
import { createControllableState } from './controllable';

export interface DisclosureSnapshot {
  readonly open: boolean;
  readonly isControlled: boolean;
}

export interface DisclosureOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    previousOpen: boolean,
    reason: OpenChangeReason,
  ) => void;
}

export interface DisclosureController {
  getSnapshot(): DisclosureSnapshot;
  subscribe(listener: () => void): () => void;
  open(reason?: OpenChangeReason): boolean;
  close(reason?: OpenChangeReason): boolean;
  toggle(reason?: OpenChangeReason): boolean;
  destroy(): void;
}

export function createDisclosure(options: DisclosureOptions = {}): DisclosureController {
  const controllable = createControllableState<boolean>({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    isControlled: options.open !== undefined,
    onChange: (open, previousOpen) => {
      options.onOpenChange?.(open, previousOpen, 'programmatic');
    },
  });

  function attemptChange(
    next: boolean,
    reason: OpenChangeReason,
  ): boolean {
    const snapshot = controllable.getSnapshot();
    if (snapshot.value === next) return true;
    const event = createCancellableEvent();
    options.onOpenChange?.(next, snapshot.value, reason);
    if (event.result.defaultPrevented) return false;
    controllable.setValue(next);
    return true;
  }

  return {
    getSnapshot() {
      const s = controllable.getSnapshot();
      return { open: s.value, isControlled: s.isControlled };
    },
    subscribe: controllable.subscribe.bind(controllable),
    open(reason = 'programmatic') {
      return attemptChange(true, reason);
    },
    close(reason = 'programmatic') {
      return attemptChange(false, reason);
    },
    toggle(reason = 'trigger') {
      const snapshot = controllable.getSnapshot();
      return attemptChange(!snapshot.value, reason);
    },
    destroy() {
      controllable.destroy();
    },
  };
}

export function shouldIgnorePointer(meta: {
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
}): boolean {
  return Boolean(meta.disabled || meta.readonly || meta.loading);
}
