import { getGeneratedComponentSpec } from './spec-lookup';

export const navigationMenuSpec = getGeneratedComponentSpec({
  id: 'navigation-menu',
  displayName: 'Navigation Menu',
  purpose: 'Site navigation with nested sections.',
  taxonomy: 'organism',
  engineeringFamily: 'navigation',
  complexity: 'complex',
  status: 'stable',
  profile: 'navigation',
});
