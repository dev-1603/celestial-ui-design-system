export interface TypeaheadOptions {
  timeout?: number;
  collator?: Intl.Collator;
}

export interface TypeaheadSnapshot {
  readonly buffer: string;
}

export interface TypeaheadController {
  getSnapshot(): TypeaheadSnapshot;
  subscribe(listener: () => void): () => void;
  handleChar(char: string): string;
  reset(): void;
  match(items: readonly { id: string; textValue?: string }[]): string | null;
  destroy(): void;
}

export function createTypeahead(options: TypeaheadOptions = {}): TypeaheadController {
  const timeout = options.timeout ?? 500;
  const collator = options.collator;
  let buffer = '';
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();
  let destroyed = false;

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function resetTimer(): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      buffer = '';
      notify();
    }, timeout);
  }

  return {
    getSnapshot() {
      return { buffer };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    handleChar(char) {
      if (destroyed) return buffer;
      buffer += char;
      resetTimer();
      notify();
      return buffer;
    },
    reset() {
      buffer = '';
      if (timer) clearTimeout(timer);
      timer = null;
      notify();
    },
    match(items) {
      if (!buffer) return null;
      const lower = buffer.toLowerCase();
      for (const item of items) {
        const text = (item.textValue ?? item.id).toLowerCase();
        const matches = collator
          ? collator.compare(text.slice(0, buffer.length), lower) === 0
          : text.startsWith(lower);
        if (matches) return item.id;
      }
      return null;
    },
    destroy() {
      destroyed = true;
      if (timer) clearTimeout(timer);
      listeners.clear();
      buffer = '';
    },
  };
}
