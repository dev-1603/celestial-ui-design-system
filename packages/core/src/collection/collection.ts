export interface CollectionItem {
  readonly id: string;
  readonly disabled?: boolean;
  readonly textValue?: string;
  readonly parentId?: string;
}

export interface CollectionSnapshot {
  readonly items: readonly CollectionItem[];
  readonly activeId: string | null;
}

export interface CollectionController {
  getSnapshot(): CollectionSnapshot;
  subscribe(listener: () => void): () => void;
  register(item: CollectionItem): () => void;
  setActiveId(id: string | null): void;
  getNextActiveId(direction: 'next' | 'prev', wrap?: boolean): string | null;
  getVisibleItems(): readonly CollectionItem[];
  destroy(): void;
}

function nextEnabledIndex(
  length: number,
  currentIdx: number,
  direction: 'next' | 'prev',
  wrap: boolean,
): number {
  if (currentIdx === -1) {
    if (direction === 'next') {
      return 0;
    }
    return length - 1;
  }
  if (direction === 'next') {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= length) {
      return wrap ? 0 : currentIdx;
    }
    return nextIdx;
  }
  const prevIdx = currentIdx - 1;
  if (prevIdx < 0) {
    return wrap ? length - 1 : currentIdx;
  }
  return prevIdx;
}

export function createCollection(): CollectionController {
  const items: CollectionItem[] = [];
  let activeId: string | null = null;
  const listeners = new Set<() => void>();
  let destroyed = false;

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function getVisibleItems(): readonly CollectionItem[] {
    return items.filter((item) => !item.parentId || items.some((p) => p.id === item.parentId));
  }

  function getEnabledItems(): readonly CollectionItem[] {
    return getVisibleItems().filter((item) => !item.disabled);
  }

  return {
    getSnapshot() {
      return { items: [...items], activeId };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    register(item) {
      if (destroyed) return () => {};
      items.push(item);
      notify();
      return () => {
        const idx = items.findIndex((i) => i.id === item.id);
        if (idx !== -1) {
          items.splice(idx, 1);
          if (activeId === item.id) {
            activeId = getEnabledItems().at(0)?.id ?? null;
          }
          notify();
        }
      };
    },
    setActiveId(id) {
      activeId = id;
      notify();
    },
    getNextActiveId(direction, wrap = false) {
      const enabled = getEnabledItems();
      if (enabled.length === 0) return null;
      const currentIdx = activeId ? enabled.findIndex((i) => i.id === activeId) : -1;
      const nextIdx = nextEnabledIndex(enabled.length, currentIdx, direction, wrap);
      return enabled.at(nextIdx)?.id ?? null;
    },
    getVisibleItems,
    destroy() {
      destroyed = true;
      items.length = 0;
      activeId = null;
      listeners.clear();
    },
  };
}
