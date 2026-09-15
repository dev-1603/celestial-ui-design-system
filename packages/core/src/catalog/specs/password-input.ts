import { getGeneratedComponentSpec } from './spec-lookup';

export const passwordInputSpec = getGeneratedComponentSpec({
  id: 'password-input',
  displayName: 'Password Input',
  purpose: 'Masked password entry control.',
  taxonomy: 'atomic',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
