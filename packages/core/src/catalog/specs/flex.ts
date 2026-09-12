import { getGeneratedComponentSpec } from './spec-lookup';

export const flexSpec = getGeneratedComponentSpec({
  id: 'flex',
  displayName: 'Flex',
  purpose: 'Flexbox layout container.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'layout',
});
