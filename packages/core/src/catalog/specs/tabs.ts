import { getGeneratedComponentSpec } from './spec-lookup';

export const tabsSpec = getGeneratedComponentSpec({
  id: 'tabs',
  displayName: 'Tabs',
  purpose: 'Tabbed interface with one active panel.',
  taxonomy: 'molecular',
  engineeringFamily: 'navigation',
  complexity: 'moderate',
  status: 'stable',
  profile: 'collection-tabs',
});
