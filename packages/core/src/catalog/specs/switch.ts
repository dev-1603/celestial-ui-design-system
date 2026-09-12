import { getGeneratedComponentSpec } from './spec-lookup';

export const switchSpec = getGeneratedComponentSpec({
  id: 'switch',
  displayName: 'Switch',
  purpose: 'Binary on/off toggle control.',
  taxonomy: 'atomic',
  engineeringFamily: 'forms',
  complexity: 'simple',
  status: 'stable',
  profile: 'form-binary',
});
