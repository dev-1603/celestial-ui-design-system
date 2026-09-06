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

export function createRovingFocus(
  collection: CollectionController,
): RovingFocusController {
  return {
    getSnapshot() {
      return { activeId: collection.getSnapshot().activeId };
    },
    subscribe(listener) {
      return collection.subscribe(listener);
    },
    handleKey(key, wrap = true) {
      const direction =
        key === 'ArrowDown' || key === 'ArrowRight'
          ? 'next'
          : key === 'ArrowUp' || key === 'ArrowLeft'
            ? 'prev'
            : key === 'Home'
              ? 'next'
              : key === 'End'
                ? 'prev'
                : null;
      if (!direction) return;
      if (key === 'Home') {
        const items = collection.getVisibleItems().filter((i) => !i.disabled);
        collection.setActiveId(items[0]?.id ?? null);
        return;
      }
      if (key === 'End') {
        const items = collection.getVisibleItems().filter((i) => !i.disabled);
        collection.setActiveId(items[items.length - 1]?.id ?? null);
        return;
      }
      const nextId = collection.getNextActiveId(direction, wrap);
      if (nextId) collection.setActiveId(nextId);
    },
    destroy() {
      // collection owned externally
    },
  };
}
