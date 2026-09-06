import type { ComponentId } from '../ids';
import type { PropsContract } from '../props/types';
import type { StatesContract } from '../state/state';
import type { EventsContract } from '../events/types';
import type { SlotsContract, PartsContract, CompositionContract } from '../slots/types';
import type { AccessibilityContract } from '../accessibility/types';
import type { BehaviorContract } from '../behavior/types';
import type { ControlledStateContract } from '../behavior/controlled-types';
import type { PolymorphismContract } from '../polymorphism/types';
import type { RefContract } from '../refs/types';
import type { LocalizationKeysContract } from '../localization/types';
import type { FormFieldContract } from '../forms/types';
import type { OverlayContract } from '../overlay/overlay';
import type { SizeContract } from '../sizes/types';
import type { PointerContract } from '../interaction/pointer-types';
import type { KeyboardContract } from '../accessibility/keyboard-contract';
import type { FocusContract } from '../accessibility/focus-contract';
import type { CollectionContract, SelectionContract } from '../collection/contracts';
import type {
  ConformanceContract,
  EnvironmentContract,
  DiagnosticsContract,
} from '../conformance/types';

export type { IdentityContract, DefaultsContract } from './identity';

export type VariantDefinition = {
  name: string;
  values: readonly string[];
  default?: string;
};

export interface VariantsContract {
  variants: Record<string, VariantDefinition>;
}

/**
 * Canonical composable component contract.
 *
 * Components declare only the contract sections that apply to their semantics.
 */
export interface ComponentContract {
  readonly id: ComponentId;
  readonly version: string;
  readonly schemaVersion: string;
  readonly props?: PropsContract;
  readonly states?: StatesContract;
  readonly variants?: VariantsContract;
  readonly sizes?: SizeContract;
  readonly slots?: SlotsContract;
  readonly parts?: PartsContract;
  readonly events?: EventsContract;
  readonly accessibility?: AccessibilityContract;
  readonly behavior?: BehaviorContract;
  readonly keyboard?: KeyboardContract;
  readonly pointer?: PointerContract;
  readonly focus?: FocusContract;
  readonly composition?: CompositionContract;
  readonly controlled?: ControlledStateContract;
  readonly polymorphism?: PolymorphismContract;
  readonly refs?: RefContract;
  readonly localization?: LocalizationKeysContract;
  readonly formField?: FormFieldContract;
  readonly collection?: CollectionContract;
  readonly selection?: SelectionContract;
  readonly overlay?: OverlayContract;
  readonly environment?: EnvironmentContract;
  readonly conformance?: ConformanceContract;
  readonly diagnostics?: DiagnosticsContract;
  readonly extensions?: Readonly<Record<string, unknown>>;
}
