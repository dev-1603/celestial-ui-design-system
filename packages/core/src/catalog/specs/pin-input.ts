import { getGeneratedComponentSpec } from './spec-lookup';

export const pinInputSpec = getGeneratedComponentSpec({
  id: 'pin-input',
  displayName: 'Pin Input',
  purpose: 'Fixed-length PIN entry control.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
