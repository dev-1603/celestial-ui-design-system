import type { KeyboardIntent } from '../interaction/keyboard';

export interface KeyboardBindingSpec {
  readonly keys: readonly string[];
  readonly intent: KeyboardIntent | string;
  readonly description?: string;
  readonly whenDisabled?: 'ignore' | 'allow';
}

export interface KeyboardContract {
  readonly bindings: readonly KeyboardBindingSpec[];
  readonly roving?: boolean;
  readonly typeahead?: boolean;
}
