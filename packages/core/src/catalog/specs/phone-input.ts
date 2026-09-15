import { getGeneratedComponentSpec } from './spec-lookup';

export const phoneInputSpec = getGeneratedComponentSpec({
  id: 'phone-input',
  displayName: 'Phone Input',
  purpose: 'Phone number entry with formatting.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
