import { getGeneratedComponentSpec } from './spec-lookup';

export const timePickerSpec = getGeneratedComponentSpec({
  id: 'time-picker',
  displayName: 'Time Picker',
  purpose: 'Time-of-day selection control.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'complex',
  status: 'stable',
  profile: 'form-selection',
});
