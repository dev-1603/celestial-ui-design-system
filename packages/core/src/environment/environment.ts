export interface Environment {
  readonly isBrowser: boolean;
  getDocument(): Document | null;
  getWindow(): Window | null;
  getActiveElement(): Element | null;
  focus(element: Element | null): void;
  measure(element: Element): DOMRect | null;
  getPortalHost(id?: string): Element | null;
  lockScroll?(): () => void;
  setInert?(element: Element, inert: boolean): void;
}

export function createBrowserEnvironment(): Environment {
  return {
    isBrowser: true,
    getDocument() {
      return typeof document !== 'undefined' ? document : null;
    },
    getWindow() {
      return typeof window !== 'undefined' ? window : null;
    },
    getActiveElement() {
      const doc = this.getDocument();
      return doc?.activeElement ?? null;
    },
    focus(element) {
      if (element && 'focus' in element && typeof element.focus === 'function') {
        element.focus();
      }
    },
    measure(element) {
      if ('getBoundingClientRect' in element) {
        return element.getBoundingClientRect();
      }
      return null;
    },
    getPortalHost(id) {
      const doc = this.getDocument();
      if (!doc) return null;
      if (!id) return doc.body;
      return doc.getElementById(id) ?? doc.body;
    },
    lockScroll() {
      const doc = this.getDocument();
      if (!doc?.body) return () => {};
      const prev = doc.body.style.overflow;
      doc.body.style.overflow = 'hidden';
      return () => {
        doc.body.style.overflow = prev;
      };
    },
    setInert(element, inert) {
      if ('inert' in element) {
        (element as HTMLElement).inert = inert;
      }
    },
  };
}

export function createNullEnvironment(): Environment {
  return {
    isBrowser: false,
    getDocument: () => null,
    getWindow: () => null,
    getActiveElement: () => null,
    focus: () => {},
    measure: () => null,
    getPortalHost: () => null,
  };
}

export function createEnvironment(options?: { browser?: boolean }): Environment {
  if (options?.browser === false) {
    return createNullEnvironment();
  }
  if (typeof document !== 'undefined') {
    return createBrowserEnvironment();
  }
  return createNullEnvironment();
}
