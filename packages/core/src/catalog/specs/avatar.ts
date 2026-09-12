import { getGeneratedComponentSpec } from './spec-lookup';

export const avatarSpec = getGeneratedComponentSpec({
  id: 'avatar',
  displayName: 'Avatar',
  purpose: 'Visual representation of a user or entity.',
  taxonomy: 'atomic',
  engineeringFamily: 'media',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
