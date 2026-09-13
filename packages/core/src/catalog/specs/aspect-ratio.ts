import { getGeneratedComponentSpec } from './spec-lookup';

export const aspectRatioSpec = getGeneratedComponentSpec({
  id: 'aspect-ratio',
  displayName: 'Aspect Ratio',
  purpose: 'Maintains width-to-height ratio for embedded content.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'minimal',
});
