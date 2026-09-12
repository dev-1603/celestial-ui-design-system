import { getGeneratedComponentSpec } from './spec-lookup';

export const drawerSpec = getGeneratedComponentSpec({
  id: 'drawer',
  displayName: 'Drawer',
  purpose: 'Edge-anchored overlay panel for secondary tasks.',
  taxonomy: 'organism',
  engineeringFamily: 'overlays',
  complexity: 'moderate',
  status: 'stable',
  profile: 'overlay-modal',
});
