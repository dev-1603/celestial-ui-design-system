import { getGeneratedComponentSpec } from './spec-lookup';

export const dropdownMenuSpec = getGeneratedComponentSpec({
  id: 'dropdown-menu',
  displayName: 'Dropdown Menu',
  purpose: 'Menu opened from a trigger control.',
  taxonomy: 'molecular',
  engineeringFamily: 'overlays',
  complexity: 'moderate',
  status: 'stable',
  profile: 'overlay-menu',
});
