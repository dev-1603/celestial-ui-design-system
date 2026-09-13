import { getGeneratedComponentSpec } from './spec-lookup';

export const listSpec = getGeneratedComponentSpec({
  id: 'list',
  displayName: 'List',
  purpose: 'Ordered or unordered list container.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'layout',
});
