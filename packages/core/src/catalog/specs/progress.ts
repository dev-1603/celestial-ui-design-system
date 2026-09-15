import { getGeneratedComponentSpec } from './spec-lookup';

export const progressSpec = getGeneratedComponentSpec({
  id: 'progress',
  displayName: 'Progress',
  purpose: 'Visual indicator of completion progress.',
  taxonomy: 'atomic',
  engineeringFamily: 'feedback',
  complexity: 'simple',
  status: 'stable',
  profile: 'feedback',
});
