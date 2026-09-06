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
export { getComponentSpec, listComponentSpecs } from './specs/registry';
