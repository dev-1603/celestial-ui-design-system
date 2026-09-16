import type { KeyboardIntent } from '../interaction/keyboard';

/**
 * Canonical keyboard intents plus adapter-defined extension keys.
 * `string & {}` keeps the canonical union for autocomplete without collapsing
 * the type to a plain `string` (custom keys remain allowed).
 */
export type KeyboardBindingIntent = KeyboardIntent | (string & {});

export interface KeyboardBindingSpec {
  readonly keys: readonly string[];
  readonly intent: KeyboardBindingIntent;
  readonly description?: string;
  readonly whenDisabled?: 'ignore' | 'allow';
}

export interface KeyboardContract {
  readonly bindings: readonly KeyboardBindingSpec[];
  readonly roving?: boolean;
  readonly typeahead?: boolean;
}
