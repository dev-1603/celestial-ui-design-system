/**
 * Framework-neutral pointer semantics.
 *
 * These describe WHAT interaction means — not React/Vue/Svelte event types.
 */

export type PointerSemanticAction =
  | 'pointerdown'
  | 'pointerup'
  | 'press'
  | 'click'
  | 'hover'
  | 'longpress'
  | 'contextmenu'
  | 'pointercapture'
  | 'pointercancel';

export interface PointerInteractionSpec {
  readonly action: PointerSemanticAction;
  readonly description?: string;
  /** When true, the action must not fire while disabled/readonly/loading. */
  readonly suppressWhenDisabled?: boolean;
}

export interface PointerContract {
  readonly interactions: readonly PointerInteractionSpec[];
  /** Global suppression when the component is non-interactive. */
  readonly suppressWhenDisabled?: boolean;
  readonly supportsContextMenu?: boolean;
  readonly supportsLongPress?: boolean;
  readonly supportsPointerCapture?: boolean;
}

export interface PointerInteractionMeta {
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly loading?: boolean;
}

/** Returns true when pointer-driven activation should be ignored. */
export function shouldSuppressPointerInteraction(meta: PointerInteractionMeta): boolean {
  return Boolean(meta.disabled || meta.readonly || meta.loading);
}
