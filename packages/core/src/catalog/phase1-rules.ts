import type { ComponentId } from '../ids';
import { assertComponentId } from '../ids';
import type { ComponentContract } from '../contracts/types';
import type { ComponentSpec } from '../spec/spec';
import { coreError, type CoreError } from '../diagnostics/errors';
import { isPhase1ContractRequired } from './priority-map';

function childIds(...ids: string[]): readonly ComponentId[] {
  return ids.map((id) => assertComponentId(id));
}

/** Components that must declare composition.allowedChildren (catalog child IDs). */
export const PHASE1_COMPOSITION_REQUIRED: Readonly<Record<string, readonly ComponentId[]>> = {
  'alert-dialog': childIds('button', 'text', 'heading', 'icon'),
  accordion: childIds('text', 'heading', 'icon', 'button'),
  'action-bar': childIds('button', 'text', 'icon'),
  'app-shell': childIds('sidebar', 'page-header', 'stack', 'box', 'container'),
  breadcrumb: childIds('link', 'text', 'icon'),
  calendar: childIds('button', 'text', 'icon'),
  card: childIds('heading', 'text', 'button', 'icon', 'badge'),
  collapsible: childIds('button', 'text', 'icon'),
  combobox: childIds('input', 'popover', 'icon', 'label', 'text'),
  command: childIds('input', 'icon', 'text', 'button'),
  'context-menu': childIds('button', 'separator', 'icon', 'text'),
  'data-table': childIds('table', 'checkbox', 'pagination', 'button', 'icon', 'text'),
  'date-picker': childIds('input', 'calendar', 'popover', 'button', 'icon', 'label'),
  dialog: childIds('button', 'text', 'heading', 'icon'),
  drawer: childIds('button', 'text', 'heading', 'icon'),
  'dropdown-menu': childIds('button', 'separator', 'icon', 'text'),
  form: childIds(
    'input',
    'textarea',
    'label',
    'checkbox',
    'switch',
    'radio-group',
    'select',
    'button',
    'search-input',
  ),
  'file-upload': childIds('button', 'text', 'icon'),
  'hover-card': childIds('button', 'text', 'icon'),
  menubar: childIds('button', 'dropdown-menu', 'icon', 'text'),
  'navigation-menu': childIds('link', 'button', 'icon', 'text'),
  pagination: childIds('button', 'icon', 'text'),
  'page-header': childIds('heading', 'text', 'button', 'breadcrumb', 'icon'),
  popover: childIds('button', 'text', 'icon'),
  select: childIds('label', 'icon', 'text'),
  sheet: childIds('button', 'text', 'heading', 'icon'),
  sidebar: childIds('button', 'link', 'icon', 'text', 'avatar'),
  table: childIds('checkbox', 'button', 'text', 'icon'),
  tabs: childIds('text', 'icon', 'button'),
  'time-picker': childIds('input', 'button', 'popover', 'icon'),
  toolbar: childIds('button', 'toggle', 'separator', 'icon'),
  'toggle-group': childIds('toggle'),
  tooltip: childIds('text', 'icon'),
};

/** Form controls that register name/value — must declare formField. */
export const PHASE1_FORM_FIELD_REQUIRED = new Set<string>([
  'checkbox',
  'combobox',
  'date-picker',
  'file-upload',
  'input',
  'input-otp',
  'number-input',
  'password-input',
  'phone-input',
  'pin-input',
  'radio-group',
  'rating',
  'search-input',
  'segmented-control',
  'select',
  'slider',
  'switch',
  'textarea',
  'time-picker',
  'toggle-group',
  'segmented-control',
]);

/** Annotative / container — formField must be absent. */
export const PHASE1_FORM_FIELD_FORBIDDEN = new Set<string>([
  'form',
  'label',
  'button',
  'link',
  'dialog',
  'alert-dialog',
  'drawer',
  'sheet',
]);

export function getRequiredCompositionChildren(id: string): readonly ComponentId[] | undefined {
  return PHASE1_COMPOSITION_REQUIRED[id as ComponentId];
}

export function applyPhase1Composition(
  id: string,
  contract: ComponentContract,
): ComponentContract {
  const children = getRequiredCompositionChildren(id);
  if (!children?.length) {
    return contract;
  }
  return {
    ...contract,
    composition: { allowedChildren: [...children] },
  };
}

function bindingKey(binding: { keys: readonly string[]; intent: string }): string {
  return `${binding.keys.join('+')}:${binding.intent}`;
}

export function validateKeyboardSourceOfTruth(
  contract: ComponentContract,
  errors: CoreError[],
): void {
  const a11yKeyboard = contract.accessibility?.keyboard;
  const bindings = contract.keyboard?.bindings;
  if (!a11yKeyboard?.length) {
    return;
  }
  if (!bindings?.length) {
    errors.push(
      coreError(
        'INVALID_CONTRACT',
        'accessibility.keyboard is deprecated; declare intents only in keyboard.bindings.',
        { layer: 'contract', componentId: contract.id },
      ),
    );
    return;
  }
  const bindingSet = new Set(bindings.map(bindingKey));
  for (const spec of a11yKeyboard) {
    if (!bindingSet.has(bindingKey(spec))) {
      errors.push(
        coreError(
          'INVALID_CONTRACT',
          `accessibility.keyboard binding ${bindingKey(spec)} is not mirrored in keyboard.bindings.`,
          { layer: 'contract', componentId: contract.id },
        ),
      );
    }
  }
}

export function validateRequiresRole(
  contract: ComponentContract,
  errors: CoreError[],
): void {
  if (!contract.behavior?.requiresRole) {
    return;
  }
  if (!contract.accessibility?.role) {
    errors.push(
      coreError(
        'INVALID_CONTRACT',
        'behavior.requiresRole requires accessibility.role to be declared.',
        { layer: 'contract', componentId: contract.id },
      ),
    );
  }
}

export function validatePhase1FormField(
  contract: ComponentContract,
  errors: CoreError[],
): void {
  const id = contract.id;
  if (!isPhase1ContractRequired(id)) {
    return;
  }
  const hasFormField = Boolean(contract.formField?.fields?.length);
  if (PHASE1_FORM_FIELD_REQUIRED.has(id) && !hasFormField) {
    errors.push(
      coreError(
        'INVALID_CONTRACT',
        'Phase 1 form control requires formField contract.',
        { layer: 'contract', componentId: id },
      ),
    );
  }
  if (PHASE1_FORM_FIELD_FORBIDDEN.has(id) && hasFormField) {
    errors.push(
      coreError(
        'INVALID_CONTRACT',
        'Container/annotative component must not declare formField.',
        { layer: 'contract', componentId: id },
      ),
    );
  }
}

export function validatePhase1Composition(
  contract: ComponentContract,
  errors: CoreError[],
): void {
  if (!isPhase1ContractRequired(contract.id)) {
    return;
  }
  const required = getRequiredCompositionChildren(contract.id);
  if (!required?.length) {
    return;
  }
  const declared = contract.composition?.allowedChildren ?? [];
  if (!declared.length) {
    errors.push(
      coreError(
        'INVALID_CONTRACT',
        'Phase 1 compound component requires composition.allowedChildren.',
        { layer: 'contract', componentId: contract.id },
      ),
    );
    return;
  }
  for (const child of required) {
    if (!declared.includes(child)) {
      errors.push(
        coreError(
          'INVALID_CONTRACT',
          `composition.allowedChildren must include required child "${child}".`,
          { layer: 'contract', componentId: contract.id },
        ),
      );
    }
  }
}

export function validatePhase1ReadinessMarker(
  spec: ComponentSpec,
  errors: CoreError[],
): void {
  if (!isPhase1ContractRequired(spec.contract.id)) {
    return;
  }
  const marker = spec.contract.extensions?.phase1Readiness;
  if (marker !== 'ready') {
    errors.push(
      coreError(
        'INVALID_CONTRACT',
        'Phase 1 contract must set extensions.phase1Readiness to "ready".',
        { layer: 'contract', componentId: spec.contract.id },
      ),
    );
  }
}

export function markPhase1Ready(contract: ComponentContract): ComponentContract {
  if (!isPhase1ContractRequired(contract.id)) {
    return contract;
  }
  return {
    ...contract,
    extensions: {
      ...contract.extensions,
      phase1Readiness: 'ready',
    },
  };
}
