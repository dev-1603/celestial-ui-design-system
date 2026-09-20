export type {
  CatalogEntry,
  ComponentTaxonomy,
  EngineeringFamily,
  ComponentMetadata,
  ComponentMetadataStatus,
} from './types';
export {
  CANONICAL_CATALOG,
  getCatalogEntry,
  listCatalogEntries,
  isCatalogComponentId,
  REFERENCE_COMPONENT_IDS,
  GENERIC_COMPONENT_IDS,
} from './registry';
export type { ReferenceComponentId } from './registry';
export {
  GENERIC_COMPONENT_INVENTORY,
  buildComponentSpecFromInventory,
  getInventoryEntry,
} from './spec-factory';
export type { GenericComponentInventory, GenericInventoryEntry } from './spec-factory';
export {
  validateGenericInventory,
  validateAllComponentSpecs,
  assertGenericInventoryValid,
} from './validate-inventory';
export type { InventoryValidationIssue, InventoryValidationReport } from './validate-inventory';
export {
  PHASE1_PRIORITY_MAP,
  getPhase1Priority,
  getPhase1PriorityEntry,
  isPhase1ContractRequired,
  listIdsByPriority,
  listPhase1PriorityEntries,
} from './priority-map';
export type { Phase1Priority, Phase1PriorityEntry, Phase1PriorityMap } from './priority-map';
export { validatePhase1PriorityMap, listPhase1RequiredEntries } from './validate-priority-map';
export type { PriorityMapValidationIssue, PriorityMapValidationReport } from './validate-priority-map';
export {
  PHASE1_COMPOSITION_REQUIRED,
  PHASE1_FORM_FIELD_REQUIRED,
  applyPhase1Composition,
  markPhase1Ready,
} from './phase1-rules';
export { getComponentSpec, listComponentSpecs } from './specs/registry';
