import { getGeneratedComponentSpec } from './spec-lookup';

export const hoverCardSpec = getGeneratedComponentSpec({
  id: 'hover-card',
  displayName: 'Hover Card',
  purpose: 'Rich preview content on pointer hover.',
  taxonomy: 'molecular',
  engineeringFamily: 'overlays',
  complexity: 'moderate',
  status: 'stable',
  profile: 'overlay-floating',
});
