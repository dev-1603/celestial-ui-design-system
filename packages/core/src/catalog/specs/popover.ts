import { getGeneratedComponentSpec } from './spec-lookup';

export const popoverSpec = getGeneratedComponentSpec({
  id: 'popover',
  displayName: 'Popover',
  purpose: 'Non-modal floating content anchored to trigger.',
  taxonomy: 'molecular',
  engineeringFamily: 'overlays',
  complexity: 'moderate',
  status: 'stable',
  profile: 'overlay-floating',
});
