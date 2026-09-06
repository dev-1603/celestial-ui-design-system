import type { ComponentId } from '../../ids';
import { assertComponentId } from '../../ids';
import type { ComponentSpec } from '../../spec/spec';
import {
  GENERIC_COMPONENT_INVENTORY,
  buildComponentSpecFromInventory,
  getInventoryEntry,
} from '../spec-factory';
import { buttonSpec } from './button';
import { inputSpec } from './input';
import { checkboxSpec } from './checkbox';
import { selectSpec } from './select';
import { dialogSpec } from './dialog';
import { tableSpec } from './table';

const REFERENCE_SPECS: Readonly<Record<string, ComponentSpec>> = {
  button: buttonSpec,
  input: inputSpec,
  checkbox: checkboxSpec,
  select: selectSpec,
  dialog: dialogSpec,
  table: tableSpec,
};

const generatedSpecs = new Map<ComponentId, ComponentSpec>();

function loadGeneratedSpec(id: string): ComponentSpec {
  const componentId = assertComponentId(id);
  const cached = generatedSpecs.get(componentId);
  if (cached) return cached;

  const entry = getInventoryEntry(id);
  if (!entry) {
    throw new Error(`Unknown catalog component id: ${id}`);
  }
  if (entry.referenceSpec) {
    const reference = REFERENCE_SPECS[id];
    if (!reference) {
      throw new Error(`Missing reference spec implementation for "${id}"`);
    }
    generatedSpecs.set(componentId, reference);
    return reference;
  }

  const spec = buildComponentSpecFromInventory(entry);
  generatedSpecs.set(componentId, spec);
  return spec;
}

export function getComponentSpec(id: string): ComponentSpec {
  return loadGeneratedSpec(id);
}

export function listComponentSpecs(): readonly ComponentSpec[] {
  return GENERIC_COMPONENT_INVENTORY.entries.map((entry) => loadGeneratedSpec(entry.id));
}

export function isCatalogComponentId(id: string): id is ComponentId {
  return GENERIC_COMPONENT_INVENTORY.entries.some((entry) => entry.id === id);
}

export { REFERENCE_SPECS };
