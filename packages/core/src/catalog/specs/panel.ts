import { getGeneratedComponentSpec } from './spec-lookup';

export const panelSpec = getGeneratedComponentSpec({
  id: 'panel',
  displayName: 'Panel',
  purpose: 'Bordered content panel surface.',
  taxonomy: 'molecular',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'layout',
});
