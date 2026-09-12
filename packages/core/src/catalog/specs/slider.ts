import { getGeneratedComponentSpec } from './spec-lookup';

export const sliderSpec = getGeneratedComponentSpec({
  id: 'slider',
  displayName: 'Slider',
  purpose: 'Numeric value selection along a track.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
