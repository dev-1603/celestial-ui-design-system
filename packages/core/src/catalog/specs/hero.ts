import { getGeneratedComponentSpec } from './spec-lookup';

export const heroSpec = getGeneratedComponentSpec({
  id: 'hero',
  displayName: 'Hero',
  purpose: 'Prominent introductory page section.',
  taxonomy: 'template',
  engineeringFamily: 'templates',
  complexity: 'moderate',
  status: 'stable',
  profile: 'template',
});
