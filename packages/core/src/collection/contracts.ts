import type { SelectionMode } from '../behavior/types';

export interface CollectionContract {
  readonly ordered?: boolean;
  readonly hierarchical?: boolean;
  readonly virtualized?: boolean;
  readonly typeahead?: boolean;
  readonly rovingFocus?: boolean;
  readonly keyboardNavigation?: boolean;
}

export interface SelectionContract {
  readonly mode: SelectionMode;
  readonly deselectable?: boolean;
  readonly selectOnFocus?: boolean;
  readonly disabledItemsIgnored?: boolean;
}
