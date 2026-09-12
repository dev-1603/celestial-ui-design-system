import { getGeneratedComponentSpec } from './spec-lookup';

export const imageSpec = getGeneratedComponentSpec({
  id: 'image',
  displayName: 'Image',
  purpose: 'Responsive image with alt semantics.',
  taxonomy: 'atomic',
  engineeringFamily: 'media',
  complexity: 'simple',
  status: 'stable',
  profile: 'media',
});
