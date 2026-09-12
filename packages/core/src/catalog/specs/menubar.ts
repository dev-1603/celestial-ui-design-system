import { getGeneratedComponentSpec } from './spec-lookup';

export const menubarSpec = getGeneratedComponentSpec({
  id: 'menubar',
  displayName: 'Menubar',
  purpose: 'Horizontal menu bar with nested menus.',
  taxonomy: 'organism',
  engineeringFamily: 'navigation',
  complexity: 'complex',
  status: 'stable',
  profile: 'overlay-menu',
});
