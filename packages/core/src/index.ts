// Version
export {
  CORE_PACKAGE_VERSION,
  CONTRACT_SCHEMA_VERSION,
  SPEC_SCHEMA_VERSION,
  PLUGIN_CONTRACT_VERSION,
  isSchemaCompatible,
} from './version';

// IDs
export type { ComponentId } from './ids';
export { assertComponentId, isValidComponentId, createId } from './ids';

// Diagnostics
export type { CoreError, CoreErrorCode, CoreErrorLayer } from './diagnostics';
export {
  coreError,
  CoreContractError,
  CoreRuntimeError,
  coreWarn,
} from './diagnostics';

// Environment
export type { Environment } from './environment';
export {
  createEnvironment,
  createBrowserEnvironment,
  createNullEnvironment,
} from './environment';

// Directionality
export type { Direction, LogicalKey } from './directionality';
export { getLogicalKeyMap, resolveLogicalKey } from './directionality';

// Naming / DOM
export {
  CUI_ATTRIBUTES,
  STYLES_RESERVED_ATTRIBUTES,
  buildPartAttributes,
  toKebabCase,
} from './naming';

// Contracts & Spec
export type { ComponentContract, VariantsContract, VariantDefinition } from './contracts';
export type {
  ComponentSpec,
  ComponentMetadata,
  ComponentDefaults,
  SpecValidationReport,
} from './spec';
export type { PropDefinition, PropsContract } from './props/types';
export {
  defineComponentSpec,
  validateComponentSpec,
  serializeComponentSpec,
  parseComponentSpec,
} from './spec';
export { assertValidContract, validateComponentContract } from './contracts/validate';

// State
export type {
  ComponentState,
  StatesContract,
  StateSetSnapshot,
  DomStateAttributes,
} from './state';
export {
  COMPONENT_STATES,
  createStateSet,
  serializeStates,
  statesToDomAttributes,
} from './state';

// Events
export type {
  SemanticEventName,
  EventsContract,
  OpenChangeEventPayload,
  ChangeEventPayload,
} from './events';
export { createCancellableEvent } from './events';

// Slots / Parts
export type {
  SlotDefinition,
  PartDefinition,
  SlotsContract,
  PartsContract,
  CompositionContract,
} from './slots';

// Accessibility
export type {
  AccessibilityContract,
  A11ySnapshot,
  BuildAriaPropsInput,
  FocusManager,
} from './accessibility';
export { buildAriaProps, createFocusManager, getFocusRestoreTarget } from './accessibility';

// Behavior
export type {
  Controller,
  BehaviorContract,
  ControllableState,
  DisclosureController,
} from './behavior';
export {
  createControllableState,
  createDisclosure,
  shouldIgnorePointer,
} from './behavior';

// Interaction
export type { KeyboardIntent } from './interaction';
export { resolveKeyboardIntent, createTypeahead } from './interaction';
export type {
  PointerContract,
  PointerSemanticAction,
  PointerInteractionSpec,
} from './interaction/pointer-types';
export { shouldSuppressPointerInteraction } from './interaction/pointer-types';
export type { SizeContract } from './sizes/types';
export { isValidSizeValue, resolveSizeValue } from './sizes/types';

// Collection
export type {
  CollectionItem,
  CollectionController,
  SelectionController,
} from './collection';
export {
  createCollection,
  createSelection,
  createRovingFocus,
} from './collection';

// Forms
export type { FormFieldContract, FormFieldController } from './forms';
export { createFormFieldState } from './forms';

// Overlay
export type { OverlayContract, OverlayController, OverlaySnapshot } from './overlay';
export { createOverlayController, getTopOverlay } from './overlay';

// Runtime & Plugins
export type {
  CelestialRuntime,
  CelestialRuntimeConfig,
  CreateRuntimeOptions,
  CelestialPlugin,
  CelestialPluginContext,
} from './runtime';
export { createCelestialRuntime, getDefaultRuntime } from './runtime';

// Polymorphism
export type { PolymorphismContract } from './polymorphism';
export { resolvePolymorphicTag, filterPropsForTag } from './polymorphism';

// Forwarding
export type { ForwardedPropsInput } from './forwarding';
export { mergeForwardedProps } from './forwarding';

// Refs
export type { RefContract, RefExposure } from './refs';
export { createRefExposure } from './refs';

// Localization
export type { LocalizationKey, LocalizationKeysContract } from './localization';
export { resolveMessage, createMessageResolver } from './localization';

// Adapter boundary
export type {
  FrameworkAdapterContract,
  AdapterRenderContext,
  AdapterIntegrationBoundary,
} from './adapter';
export { defineFrameworkAdapterContract, DEFAULT_ADAPTER_INTEGRATION } from './adapter';
