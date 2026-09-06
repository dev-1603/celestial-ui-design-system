export interface FormFieldContract {
  readonly fields: readonly (
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'required'
    | 'disabled'
    | 'readOnly'
    | 'invalid'
    | 'errorMessage'
    | 'description'
    | 'touched'
    | 'dirty'
  )[];
  readonly errorLiveRegion?: 'alert' | 'polite' | 'assertive';
}
