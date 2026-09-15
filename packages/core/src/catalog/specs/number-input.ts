import { getGeneratedComponentSpec } from './spec-lookup';

export const numberInputSpec = getGeneratedComponentSpec({
  id: 'number-input',
  displayName: 'Number Input',
  purpose: 'Numeric value text input.',
  taxonomy: 'atomic',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
