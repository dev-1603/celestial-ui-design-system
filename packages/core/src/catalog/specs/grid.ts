import { getGeneratedComponentSpec } from './spec-lookup';

export const gridSpec = getGeneratedComponentSpec({
  id: 'grid',
  displayName: 'Grid',
  purpose: 'CSS grid layout container.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'layout',
});
