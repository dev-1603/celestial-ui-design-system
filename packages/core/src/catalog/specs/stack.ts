import { getGeneratedComponentSpec } from './spec-lookup';

export const stackSpec = getGeneratedComponentSpec({
  id: 'stack',
  displayName: 'Stack',
  purpose: 'Flex stack layout for vertical or horizontal flow.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'layout',
});
