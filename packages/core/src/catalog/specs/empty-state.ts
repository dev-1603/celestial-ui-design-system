import { getGeneratedComponentSpec } from './spec-lookup';

export const emptyStateSpec = getGeneratedComponentSpec({
  id: 'empty-state',
  displayName: 'Empty State',
  purpose: 'Placeholder when no data is available.',
  taxonomy: 'molecular',
  engineeringFamily: 'feedback',
  complexity: 'moderate',
  status: 'stable',
  profile: 'feedback',
});
