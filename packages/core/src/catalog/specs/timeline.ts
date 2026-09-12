import { getGeneratedComponentSpec } from './spec-lookup';

export const timelineSpec = getGeneratedComponentSpec({
  id: 'timeline',
  displayName: 'Timeline',
  purpose: 'Chronological event sequence display.',
  taxonomy: 'organism',
  engineeringFamily: 'data-display',
  complexity: 'moderate',
  status: 'stable',
  profile: 'layout',
});
