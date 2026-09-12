import { getGeneratedComponentSpec } from './spec-lookup';

export const figureSpec = getGeneratedComponentSpec({
  id: 'figure',
  displayName: 'Figure',
  purpose: 'Media with optional caption.',
  taxonomy: 'molecular',
  engineeringFamily: 'media',
  complexity: 'simple',
  status: 'stable',
  profile: 'media',
});
