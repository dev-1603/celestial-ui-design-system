import { getGeneratedComponentSpec } from './spec-lookup';

export const bannerSpec = getGeneratedComponentSpec({
  id: 'banner',
  displayName: 'Banner',
  purpose: 'Prominent page-level message strip.',
  taxonomy: 'molecular',
  engineeringFamily: 'feedback',
  complexity: 'moderate',
  status: 'stable',
  profile: 'feedback',
});
