import type { ComponentId } from '../ids';

export interface SlotDefinition {
  readonly name: string;
  readonly required?: boolean;
  readonly description?: string;
}

export interface PartDefinition {
  readonly name: string;
  readonly required: boolean;
  readonly refTarget?: boolean;
  readonly receivesNativeProps?: boolean;
}

export interface SlotsContract {
  readonly slots: Readonly<Record<string, SlotDefinition>>;
}

export interface PartsContract {
  readonly parts: Readonly<Record<string, PartDefinition>>;
}

export interface CompositionContract {
  readonly allowedChildren?: readonly ComponentId[];
}
