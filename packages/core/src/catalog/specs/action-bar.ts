import { getGeneratedComponentSpec } from './spec-lookup';

export const actionBarSpec = getGeneratedComponentSpec({
  id: 'action-bar',
  displayName: 'Action Bar',
  purpose: 'Grouped primary actions for a view.',
  taxonomy: 'molecular',
  engineeringFamily: 'navigation',
  complexity: 'moderate',
  status: 'stable',
  profile: 'navigation',
});
