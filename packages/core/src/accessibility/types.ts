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
  if (input.disabled) {
    props['aria-disabled'] = 'true';
  }
  if (input.readonly) {
    props['aria-readonly'] = 'true';
  }
  if (input.busy) {
    props['aria-busy'] = 'true';
  }
  if (input.invalid !== undefined) {
    props['aria-invalid'] = input.invalid ? 'true' : 'false';
  }
  if (input.expanded !== undefined) {
    props['aria-expanded'] = input.expanded ? 'true' : 'false';
  }
  if (input.selected) {
    props['aria-selected'] = 'true';
  }
  if (input.checked !== undefined) {
    props['aria-checked'] = input.checked;
  }
  if (input.contract?.relationships) {
    const rel = input.contract.relationships;
    if (rel.controls) props['aria-controls'] = rel.controls;
    if (rel.owns) props['aria-owns'] = rel.owns;
    if (rel.activedescendant) props['aria-activedescendant'] = rel.activedescendant;
    if (rel.labelledby) props['aria-labelledby'] = rel.labelledby;
    if (rel.describedby) props['aria-describedby'] = rel.describedby;
  }
  return props as A11ySnapshot;
}
