import { getGeneratedComponentSpec } from './spec-lookup';

export const carouselSpec = getGeneratedComponentSpec({
  id: 'carousel',
  displayName: 'Carousel',
  purpose: 'Cyclic presentation of slides or panels.',
  taxonomy: 'organism',
  engineeringFamily: 'media',
  complexity: 'complex',
  status: 'stable',
  profile: 'collection-disclosure',
});
