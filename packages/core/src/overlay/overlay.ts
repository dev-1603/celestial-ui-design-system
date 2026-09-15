export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface PositionRequest {
  readonly anchorRect: DOMRect;
  readonly contentRect: DOMRect;
  readonly placement: Placement;
}

export interface OverlayContract {
  readonly modal?: boolean;
  readonly dismissOnEscape?: boolean;
  readonly dismissOnOutside?: boolean;
  readonly scrollLock?: boolean;
  readonly portalHostId?: string;
  readonly restoreFocus?: boolean;
}

export type OverlayPhase = 'closed' | 'open' | 'closing';

export interface OverlaySnapshot {
  readonly phase: OverlayPhase;
  readonly open: boolean;
  readonly stackIndex: number;
  readonly modal: boolean;
}

export interface OverlayOptions {
  modal?: boolean;
  dismissOnEscape?: boolean;
  dismissOnOutside?: boolean;
  scrollLock?: boolean;
  portalHostId?: string;
  restoreFocus?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface OverlayController {
  getSnapshot(): OverlaySnapshot;
  subscribe(listener: () => void): () => void;
  open(): void;
  close(): void;
  requestDismiss(reason: 'escape' | 'outside' | 'action'): boolean;
  destroy(): void;
}

const overlayStacks = new WeakMap<object, OverlayController[]>();
const STACK_KEY = {};

function getStack(): OverlayController[] {
  let stack = overlayStacks.get(STACK_KEY);
  if (!stack) {
    stack = [];
    overlayStacks.set(STACK_KEY, stack);
  }
  return stack;
}

export function createOverlayController(options: OverlayOptions = {}): OverlayController {
  let phase: OverlayPhase = (options.open ?? options.defaultOpen) ? 'open' : 'closed';
  let open = phase === 'open';
  const listeners = new Set<() => void>();
  let destroyed = false;
  const modal = options.modal ?? true;
  const stack = getStack();

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function pushStack(): void {
    if (!stack.includes(controller)) {
      stack.push(controller);
    }
  }

  function popStack(): void {
    const idx = stack.indexOf(controller);
    if (idx !== -1) stack.splice(idx, 1);
  }

  const controller: OverlayController = {
    getSnapshot() {
      const stackIndex = stack.indexOf(controller);
      return {
        phase,
        open,
        stackIndex: stackIndex === -1 ? -1 : stackIndex,
        modal,
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    open() {
      if (destroyed) return;
      open = true;
      phase = 'open';
      pushStack();
      options.onOpenChange?.(true);
      notify();
    },
    close() {
      if (destroyed) return;
      open = false;
      phase = 'closed';
      popStack();
      options.onOpenChange?.(false);
      notify();
    },
    requestDismiss(reason) {
      if (destroyed || !open) return false;
      const top = stack.at(-1);
      if (top !== controller) return false;
      if (reason === 'escape' && options.dismissOnEscape === false) return false;
      if (reason === 'outside' && options.dismissOnOutside === false) return false;
      controller.close();
      return true;
    },
    destroy() {
      destroyed = true;
      popStack();
      listeners.clear();
      phase = 'closed';
      open = false;
    },
  };

  if (open) pushStack();
  return controller;
}

export function getTopOverlay(): OverlayController | null {
  const stack = getStack();
  return stack.at(-1) ?? null;
}
