export type FocusInitialTarget = 'first' | 'autofocus' | 'none' | 'content';

export interface FocusContract {
  readonly trap?: boolean;
  readonly restoreOnClose?: boolean;
  readonly initialFocus?: FocusInitialTarget;
  readonly roving?: boolean;
  readonly visibleOnly?: boolean;
}
