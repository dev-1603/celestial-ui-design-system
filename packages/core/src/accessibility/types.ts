export type AccessibleNameSource = 'prop:ariaLabel' | 'slot:label' | 'contents';

export type AriaRelationship =
  'controls' | 'owns' | 'activedescendant' | 'labelledby' | 'describedby';

export interface KeyboardSpec {
  readonly keys: readonly string[];
  readonly intent: string;
  readonly description?: string;
}

export interface FocusSpec {
  readonly trap?: boolean;
  readonly restoreOnClose?: boolean;
  readonly initialFocus?: 'first' | 'autofocus' | 'none' | 'content';
}

export interface AccessibilityContract {
  readonly role?: string;
  readonly name?: { readonly from: AccessibleNameSource };
  readonly descriptionId?: string;
  readonly keyboard?: readonly KeyboardSpec[];
  readonly focus?: FocusSpec;
  readonly relationships?: Readonly<Partial<Record<AriaRelationship, string>>>;
  readonly disabledFocusable?: boolean;
}

export interface A11ySnapshot {
  readonly role?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'aria-describedby'?: string;
  readonly 'aria-disabled'?: 'true';
  readonly 'aria-expanded'?: 'true' | 'false';
  readonly 'aria-selected'?: 'true' | 'false';
  readonly 'aria-checked'?: 'true' | 'false' | 'mixed';
  readonly 'aria-invalid'?: 'true' | 'false';
  readonly 'aria-busy'?: 'true';
  readonly 'aria-readonly'?: 'true';
  readonly 'aria-controls'?: string;
  readonly 'aria-owns'?: string;
  readonly 'aria-activedescendant'?: string;
}

export interface BuildAriaPropsInput {
  readonly contract?: AccessibilityContract;
  readonly ariaLabel?: string;
  readonly labelledBy?: string;
  readonly describedBy?: string;
  readonly expanded?: boolean;
  readonly selected?: boolean;
  readonly checked?: 'true' | 'false' | 'mixed';
  readonly invalid?: boolean;
  readonly busy?: boolean;
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly componentId?: string;
}

function assignAriaFlag(
  props: Record<string, string | undefined>,
  name: keyof A11ySnapshot,
  enabled: boolean | undefined,
): void {
  if (enabled) {
    props[name] = 'true';
  }
}

function assignAriaTrueFalse(
  props: Record<string, string | undefined>,
  name: keyof A11ySnapshot,
  value: boolean | undefined,
): void {
  if (value !== undefined) {
    props[name] = value ? 'true' : 'false';
  }
}

function assignRelationshipProps(
  props: Record<string, string | undefined>,
  relationships: AccessibilityContract['relationships'],
): void {
  if (!relationships) {
    return;
  }
  if (relationships.controls) props['aria-controls'] = relationships.controls;
  if (relationships.owns) props['aria-owns'] = relationships.owns;
  if (relationships.activedescendant) {
    props['aria-activedescendant'] = relationships.activedescendant;
  }
  if (relationships.labelledby) props['aria-labelledby'] = relationships.labelledby;
  if (relationships.describedby) props['aria-describedby'] = relationships.describedby;
}

export function buildAriaProps(input: BuildAriaPropsInput): A11ySnapshot {
  const props: Record<string, string | undefined> = {};
  if (input.contract?.role) {
    props.role = input.contract.role;
  }
  if (input.ariaLabel) {
    props['aria-label'] = input.ariaLabel;
  }
  if (input.labelledBy) {
    props['aria-labelledby'] = input.labelledBy;
  }
  if (input.describedBy) {
    props['aria-describedby'] = input.describedBy;
  }
  assignAriaFlag(props, 'aria-disabled', input.disabled);
  assignAriaFlag(props, 'aria-readonly', input.readonly);
  assignAriaFlag(props, 'aria-busy', input.busy);
  assignAriaTrueFalse(props, 'aria-invalid', input.invalid);
  assignAriaTrueFalse(props, 'aria-expanded', input.expanded);
  assignAriaFlag(props, 'aria-selected', input.selected);
  if (input.checked !== undefined) {
    props['aria-checked'] = input.checked;
  }
  assignRelationshipProps(props, input.contract?.relationships);
  return props as A11ySnapshot;
}
