export interface Controller<TSnapshot> {
  getSnapshot(): TSnapshot;
  subscribe(listener: () => void): () => void;
  destroy(): void;
}

export type SelectionMode = 'none' | 'single' | 'multiple';

export interface BehaviorContract {
  readonly supportsDisabled?: boolean;
  readonly supportsLoading?: boolean;
  readonly openClosed?: boolean;
  readonly selectionMode?: SelectionMode;
  readonly requiresRole?: boolean;
  readonly requiredControllers?: readonly string[];
}
