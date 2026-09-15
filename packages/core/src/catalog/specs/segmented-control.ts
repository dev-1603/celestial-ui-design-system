import { getGeneratedComponentSpec } from './spec-lookup';

export const segmentedControlSpec = getGeneratedComponentSpec({
  id: 'segmented-control',
  displayName: 'Segmented Control',
  purpose: 'Mutually exclusive compact option switcher.',
  taxonomy: 'molecular',
  engineeringFamily: 'navigation',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-binary',
});
