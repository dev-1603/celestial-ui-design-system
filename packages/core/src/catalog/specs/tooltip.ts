import { getGeneratedComponentSpec } from './spec-lookup';

export const tooltipSpec = getGeneratedComponentSpec({
  id: 'tooltip',
  displayName: 'Tooltip',
  purpose: 'Brief descriptive label on hover or focus.',
  taxonomy: 'molecular',
  engineeringFamily: 'overlays',
  complexity: 'simple',
  status: 'stable',
  profile: 'overlay-floating',
});
