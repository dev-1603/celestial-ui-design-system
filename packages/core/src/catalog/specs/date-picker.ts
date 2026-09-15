import { getGeneratedComponentSpec } from './spec-lookup';

export const datePickerSpec = getGeneratedComponentSpec({
  id: 'date-picker',
  displayName: 'Date Picker',
  purpose: 'Calendar-based date selection control.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'complex',
  status: 'stable',
  profile: 'form-selection',
});
