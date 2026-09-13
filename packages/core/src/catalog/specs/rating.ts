import { getGeneratedComponentSpec } from './spec-lookup';

export const ratingSpec = getGeneratedComponentSpec({
  id: 'rating',
  displayName: 'Rating',
  purpose: 'Star or scale rating input/display.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
