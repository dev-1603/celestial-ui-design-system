import type { ComponentId } from '../../ids';
import type { ComponentSpec } from '../../spec/spec';
import type { GenericInventoryEntry } from '../spec-factory';
import { buildComponentSpecFromInventory } from '../spec-build';

const generatedSpecs = new Map<ComponentId, ComponentSpec>();

/**
 * Load a profile-generated spec from a single inventory entry.
 *
 * This module must not import the catalog JSON or the tools hub. Generated
 * `./specs/<id>` entry points pass their own entry so a leaf (e.g. accordion)
 * does not pull every catalog component or the nine reference specs.
 */
export function getGeneratedComponentSpec(entry: GenericInventoryEntry): ComponentSpec {
  const cached = generatedSpecs.get(entry.id as ComponentId);
  if (cached) return cached;

  if (entry.referenceSpec) {
    throw new Error(
      `Component "${entry.id}" is a hand-authored reference spec. Import from "@celestial-ui/core/specs/${entry.id}" instead.`,
    );
  }

  const spec = buildComponentSpecFromInventory(entry);
  generatedSpecs.set(spec.contract.id, spec);
  return spec;
}
