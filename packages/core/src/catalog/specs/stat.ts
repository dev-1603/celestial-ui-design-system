import { getGeneratedComponentSpec } from './spec-lookup';

export const statSpec = getGeneratedComponentSpec({
  id: 'stat',
  displayName: 'Stat',
  purpose: 'Metric label and value display.',
  taxonomy: 'molecular',
  engineeringFamily: 'data-display',
  complexity: 'simple',
  status: 'stable',
  profile: 'feedback',
});
