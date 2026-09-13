import { getGeneratedComponentSpec } from './spec-lookup';

export const videoSpec = getGeneratedComponentSpec({
  id: 'video',
  displayName: 'Video',
  purpose: 'Video media presentation shell.',
  taxonomy: 'atomic',
  engineeringFamily: 'media',
  complexity: 'moderate',
  status: 'stable',
  profile: 'media',
});
