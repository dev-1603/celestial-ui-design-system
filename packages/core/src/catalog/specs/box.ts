import { getGeneratedComponentSpec } from './spec-lookup';

export const boxSpec = getGeneratedComponentSpec({
  id: 'box',
  displayName: 'Box',
  purpose: 'Generic layout primitive wrapper.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'layout',
});
