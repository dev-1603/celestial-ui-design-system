import { getGeneratedComponentSpec } from './spec-lookup';

export const searchInputSpec = getGeneratedComponentSpec({
  id: 'search-input',
  displayName: 'Search Input',
  purpose: 'Search query input with clear affordance.',
  taxonomy: 'atomic',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
