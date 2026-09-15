import { getGeneratedComponentSpec } from './spec-lookup';

export const sidebarSpec = getGeneratedComponentSpec({
  id: 'sidebar',
  displayName: 'Sidebar',
  purpose: 'Persistent or collapsible application sidebar.',
  taxonomy: 'organism',
  engineeringFamily: 'navigation',
  complexity: 'complex',
  status: 'stable',
  profile: 'navigation',
});
