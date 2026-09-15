import { getGeneratedComponentSpec } from './spec-lookup';

export const spinnerSpec = getGeneratedComponentSpec({
  id: 'spinner',
  displayName: 'Spinner',
  purpose: 'Indeterminate loading indicator.',
  taxonomy: 'atomic',
  engineeringFamily: 'feedback',
  complexity: 'simple',
  status: 'stable',
  profile: 'feedback',
});
