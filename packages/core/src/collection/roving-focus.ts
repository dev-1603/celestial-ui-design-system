import type { CollectionController } from './collection';

export interface RovingFocusSnapshot {
  readonly activeId: string | null;
}

export interface RovingFocusController {
  getSnapshot(): RovingFocusSnapshot;
  subscribe(listener: () => void): () => void;
  handleKey(key: string, wrap?: boolean): void;
  destroy(): void;
}

export function createRovingFocus(collection: CollectionController): RovingFocusController {
  return {
    getSnapshot() {
      return { activeId: collection.getSnapshot().activeId };
    },
    subscribe(listener) {
      return collection.subscribe(listener);
    },
    handleKey(key, wrap = true) {
      if (key === 'Home') {
        const firstEnabled = collection.getVisibleItems().find((i) => !i.disabled);
        collection.setActiveId(firstEnabled?.id ?? null);
        return;
      }
      if (key === 'End') {
        const enabled = collection.getVisibleItems().filter((i) => !i.disabled);
        collection.setActiveId(enabled.at(-1)?.id ?? null);
        return;
      }
      let direction: 'next' | 'prev' | null = null;
      if (key === 'ArrowDown' || key === 'ArrowRight') direction = 'next';
      else if (key === 'ArrowUp' || key === 'ArrowLeft') direction = 'prev';
      if (!direction) return;
      const nextId = collection.getNextActiveId(direction, wrap);
      if (nextId) collection.setActiveId(nextId);
    },
    destroy() {
      // collection owned externally
    },
  };
}
