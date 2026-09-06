export interface FormFieldSnapshot<T = unknown> {
  readonly name?: string;
  readonly value: T;
  readonly required: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly invalid: boolean;
  readonly touched: boolean;
  readonly dirty: boolean;
  readonly descriptionId?: string;
  readonly errorId?: string;
  readonly labelId?: string;
  readonly controlId?: string;
}

export interface FormFieldStateOptions<T = unknown> {
  name?: string;
  value?: T;
  defaultValue: T;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  onChange?: (value: T) => void;
}

export interface FormFieldController<T = unknown> {
  getSnapshot(): FormFieldSnapshot<T>;
  subscribe(listener: () => void): () => void;
  setValue(value: T): void;
  markTouched(): void;
  markDirty(): void;
  buildDescribedBy(): string | undefined;
  buildFieldAriaProps(): Record<string, string>;
  destroy(): void;
}

export function createFormFieldState<T = unknown>(
  options: FormFieldStateOptions<T>,
): FormFieldController<T> {
  const listeners = new Set<() => void>();
  let value = options.value ?? options.defaultValue;
  let touched = false;
  let dirty = false;
  let destroyed = false;
  const controlId = `cui-field-${Math.random().toString(36).slice(2, 9)}`;
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    getSnapshot() {
      return {
        name: options.name,
        value: options.value ?? value,
        required: options.required ?? false,
        disabled: options.disabled ?? false,
        readOnly: options.readOnly ?? false,
        invalid: options.invalid ?? false,
        touched,
        dirty,
        descriptionId,
        errorId,
        labelId,
        controlId,
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setValue(newValue) {
      if (destroyed) return;
      value = newValue;
      dirty = true;
      options.onChange?.(newValue);
      notify();
    },
    markTouched() {
      touched = true;
      notify();
    },
    markDirty() {
      dirty = true;
      notify();
    },
    buildDescribedBy() {
      const ids: string[] = [];
      ids.push(descriptionId);
      if (options.invalid) ids.push(errorId);
      return ids.join(' ') || undefined;
    },
    buildFieldAriaProps() {
      const snapshot = this.getSnapshot();
      const props: Record<string, string> = {
        id: controlId,
        'aria-labelledby': labelId,
      };
      const describedBy = this.buildDescribedBy();
      if (describedBy) {
        props['aria-describedby'] = describedBy;
      }
      if (snapshot.invalid) {
        props['aria-invalid'] = 'true';
      }
      if (snapshot.required) {
        props['aria-required'] = 'true';
      }
      if (snapshot.readOnly) {
        props['aria-readonly'] = 'true';
      }
      return props;
    },
    destroy() {
      destroyed = true;
      listeners.clear();
    },
  };
}
