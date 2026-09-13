import { getGeneratedComponentSpec } from './spec-lookup';

export const radioGroupSpec = getGeneratedComponentSpec({
  id: 'radio-group',
  displayName: 'Radio Group',
  purpose: 'Single selection among mutually exclusive options.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-binary',
});
