import { getGeneratedComponentSpec } from './spec-lookup';

export const containerSpec = getGeneratedComponentSpec({
  id: 'container',
  displayName: 'Container',
  purpose: 'Max-width content container.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'layout',
});
