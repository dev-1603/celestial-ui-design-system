import { getGeneratedComponentSpec } from './spec-lookup';

export const spacerSpec = getGeneratedComponentSpec({
  id: 'spacer',
  displayName: 'Spacer',
  purpose: 'Flexible spacing element.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'minimal',
});
