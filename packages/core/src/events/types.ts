export type SemanticEventName = 'change' | 'openChange' | 'select' | 'dismiss' | 'focus' | 'blur';

export type DismissReason = 'escape' | 'outside' | 'action';
export type OpenChangeReason = DismissReason | 'trigger' | 'programmatic';

export interface ChangeEventPayload<T = unknown> {
  readonly value: T;
  readonly previousValue: T;
}

export interface OpenChangeEventPayload {
  readonly open: boolean;
  readonly previousOpen: boolean;
  readonly reason: OpenChangeReason;
}

export interface SelectEventPayload<T = unknown> {
  readonly value: T;
  readonly previousValue: T | undefined;
  readonly itemId: string;
}

export interface DismissEventPayload {
  readonly reason: DismissReason;
}

export interface CancellableEventResult {
  readonly defaultPrevented: boolean;
}

export interface EventDefinition {
  readonly name: SemanticEventName;
  readonly cancellable?: boolean;
  readonly description?: string;
}

export interface EventsContract {
  readonly events: Readonly<Partial<Record<SemanticEventName, EventDefinition>>>;
}

export function createCancellableEvent(): {
  preventDefault(): void;
  readonly result: CancellableEventResult;
} {
  let defaultPrevented = false;
  return {
    preventDefault() {
      defaultPrevented = true;
    },
    get result() {
      return { defaultPrevented };
    },
  };
}
