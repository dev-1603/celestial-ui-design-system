/**
 * Declarative capability flags for a component.
 *
 * Capabilities describe which contract sections are semantically required.
 * They do not load implementations.
 */
export type ComponentCapability =
  | 'identity'
  | 'props'
  | 'defaults'
  | 'variants'
  | 'sizes'
  | 'states'
  | 'events'
  | 'slots'
  | 'parts'
  | 'behavior'
  | 'accessibility'
  | 'keyboard'
  | 'pointer'
  | 'focus'
  | 'controlled-state'
  | 'composition'
  | 'refs'
  | 'polymorphism'
  | 'directionality'
  | 'localization'
  | 'form-field'
  | 'collection'
  | 'selection'
  | 'overlay'
  | 'environment'
  | 'diagnostics'
  | 'conformance';

export const ALL_COMPONENT_CAPABILITIES: readonly ComponentCapability[] = [
  'identity',
  'props',
  'defaults',
  'variants',
  'sizes',
  'states',
  'events',
  'slots',
  'parts',
  'behavior',
  'accessibility',
  'keyboard',
  'pointer',
  'focus',
  'controlled-state',
  'composition',
  'refs',
  'polymorphism',
  'directionality',
  'localization',
  'form-field',
  'collection',
  'selection',
  'overlay',
  'environment',
  'diagnostics',
  'conformance',
] as const;

/** Maps capability flags to expected contract keys on ComponentContract. */
export const CAPABILITY_CONTRACT_KEYS: Readonly<Record<ComponentCapability, readonly string[]>> = {
  identity: ['id', 'version', 'schemaVersion'],
  props: ['props'],
  defaults: [],
  variants: ['variants'],
  sizes: ['sizes'],
  states: ['states'],
  events: ['events'],
  slots: ['slots'],
  parts: ['parts'],
  behavior: ['behavior'],
  accessibility: ['accessibility'],
  keyboard: ['keyboard'],
  pointer: ['pointer'],
  focus: ['focus'],
  'controlled-state': ['controlled'],
  composition: ['composition'],
  refs: ['refs'],
  polymorphism: ['polymorphism'],
  directionality: [],
  localization: ['localization'],
  'form-field': ['formField'],
  collection: ['collection'],
  selection: ['selection'],
  overlay: ['overlay'],
  environment: ['environment'],
  diagnostics: [],
  conformance: ['conformance'],
};

export function hasCapability(
  capabilities: readonly ComponentCapability[],
  capability: ComponentCapability,
): boolean {
  return capabilities.includes(capability);
}
