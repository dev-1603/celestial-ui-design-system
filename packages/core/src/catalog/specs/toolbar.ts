import { getGeneratedComponentSpec } from './spec-lookup';

export const toolbarSpec = getGeneratedComponentSpec({
  id: 'toolbar',
  displayName: 'Toolbar',
  purpose: 'Grouped tools and actions.',
  taxonomy: 'molecular',
  engineeringFamily: 'navigation',
  complexity: 'moderate',
  status: 'stable',
  profile: 'navigation',
});
