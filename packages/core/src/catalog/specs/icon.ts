import { getGeneratedComponentSpec } from './spec-lookup';

export const iconSpec = getGeneratedComponentSpec({
  id: 'icon',
  displayName: 'Icon',
  purpose: 'Semantic icon slot without icon engine.',
  taxonomy: 'atomic',
  engineeringFamily: 'media',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
