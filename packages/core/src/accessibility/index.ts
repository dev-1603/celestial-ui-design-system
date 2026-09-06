export type {
  AccessibleNameSource,
  AriaRelationship,
  KeyboardSpec,
  FocusSpec,
  AccessibilityContract,
  A11ySnapshot,
  BuildAriaPropsInput,
} from './types';
export { buildAriaProps } from './types';
export type { FocusTrapSnapshot, FocusManager, FocusManagerOptions } from './focus-manager';
export { createFocusManager, getFocusRestoreTarget } from './focus-manager';
