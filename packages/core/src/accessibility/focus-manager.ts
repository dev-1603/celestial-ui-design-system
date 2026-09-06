import type { Environment } from '../environment/environment';

export interface FocusTrapSnapshot {
  readonly active: boolean;
  readonly tabbableIds: readonly string[];
  readonly previouslyFocusedId: string | null;
}

export interface FocusManagerOptions {
  readonly environment: Environment;
  readonly tabbableIds?: readonly string[];
}

export interface FocusManager {
  getSnapshot(): FocusTrapSnapshot;
  subscribe(listener: () => void): () => void;
  activate(tabbableIds: readonly string[]): void;
  deactivate(): void;
  getNextTabbable(currentId: string, reverse?: boolean): string | null;
  destroy(): void;
}

export function createFocusManager(options: FocusManagerOptions): FocusManager {
  const { environment } = options;
  let active = false;
  let tabbableIds: readonly string[] = options.tabbableIds ?? [];
  let previouslyFocusedId: string | null = null;
  const listeners = new Set<() => void>();
  let destroyed = false;

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function getSnapshot(): FocusTrapSnapshot {
    return { active, tabbableIds, previouslyFocusedId };
  }

  return {
    getSnapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    activate(ids) {
      if (destroyed) return;
      const activeEl = environment.getActiveElement();
      previouslyFocusedId = activeEl?.id ?? null;
      tabbableIds = ids;
      active = true;
      notify();
    },
    deactivate() {
      if (destroyed) return;
      active = false;
      notify();
      if (previouslyFocusedId && environment.isBrowser) {
        const doc = environment.getDocument();
        const el = doc?.getElementById(previouslyFocusedId);
        if (el) environment.focus(el);
      }
      previouslyFocusedId = null;
    },
    getNextTabbable(currentId, reverse = false) {
      if (tabbableIds.length === 0) return null;
      const idx = tabbableIds.indexOf(currentId);
      if (idx === -1) return tabbableIds[0] ?? null;
      const nextIdx = reverse
        ? (idx - 1 + tabbableIds.length) % tabbableIds.length
        : (idx + 1) % tabbableIds.length;
      return tabbableIds[nextIdx] ?? null;
    },
    destroy() {
      destroyed = true;
      listeners.clear();
      active = false;
      tabbableIds = [];
      previouslyFocusedId = null;
    },
  };
}

export function getFocusRestoreTarget(
  previouslyFocusedId: string | null,
  environment: Environment,
): Element | null {
  if (!previouslyFocusedId || !environment.isBrowser) return null;
  return environment.getDocument()?.getElementById(previouslyFocusedId) ?? null;
}
