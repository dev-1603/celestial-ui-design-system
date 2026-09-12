import { getGeneratedComponentSpec } from './spec-lookup';

export const skeletonSpec = getGeneratedComponentSpec({
  id: 'skeleton',
  displayName: 'Skeleton',
  purpose: 'Placeholder loading state for content.',
  taxonomy: 'atomic',
  engineeringFamily: 'feedback',
  complexity: 'simple',
  status: 'stable',
  profile: 'minimal',
});
