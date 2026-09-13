import { getGeneratedComponentSpec } from './spec-lookup';

export const contextMenuSpec = getGeneratedComponentSpec({
  id: 'context-menu',
  displayName: 'Context Menu',
  purpose: 'Contextual action menu on pointer trigger.',
  taxonomy: 'molecular',
  engineeringFamily: 'overlays',
  complexity: 'moderate',
  status: 'stable',
  profile: 'overlay-menu',
});
