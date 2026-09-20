import type { ComponentId } from '../../ids';
import type { ComponentSpec } from '../../spec/spec';
import { GENERIC_COMPONENT_INVENTORY, getInventoryEntry } from '../spec-factory';
import { buttonSpec } from './button';
import { inputSpec } from './input';
import { checkboxSpec } from './checkbox';
import { selectSpec } from './select';
import { dialogSpec } from './dialog';
import { tableSpec } from './table';
import { labelSpec } from './label';
import { switchSpec } from './switch';
import { radioGroupSpec } from './radio-group';
import { getGeneratedComponentSpec } from './spec-lookup';

const REFERENCE_SPECS: Readonly<Record<string, ComponentSpec>> = {
  button: buttonSpec,
  input: inputSpec,
  checkbox: checkboxSpec,
  select: selectSpec,
  dialog: dialogSpec,
  table: tableSpec,
  label: labelSpec,
  switch: switchSpec,
  'radio-group': radioGroupSpec,
};

export function getComponentSpec(id: string): ComponentSpec {
  const reference = REFERENCE_SPECS[id];
  if (reference) return reference;
  const entry = getInventoryEntry(id);
  if (!entry) {
    throw new Error(`Unknown catalog component id: ${id}`);
  }
  return getGeneratedComponentSpec(entry);
}

export function listComponentSpecs(): readonly ComponentSpec[] {
  return GENERIC_COMPONENT_INVENTORY.entries.map((entry) => getComponentSpec(entry.id));
}

export function isCatalogComponentId(id: string): id is ComponentId {
  return GENERIC_COMPONENT_INVENTORY.entries.some((entry) => entry.id === id);
}

export { REFERENCE_SPECS };
