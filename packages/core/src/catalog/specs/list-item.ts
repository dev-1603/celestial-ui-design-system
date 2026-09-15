import { getGeneratedComponentSpec } from './spec-lookup';

export const listItemSpec = getGeneratedComponentSpec({
  id: 'list-item',
  displayName: 'List Item',
  purpose: 'Single item within a list.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'layout',
});
