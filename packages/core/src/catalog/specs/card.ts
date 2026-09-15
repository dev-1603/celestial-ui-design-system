import { getGeneratedComponentSpec } from './spec-lookup';

export const cardSpec = getGeneratedComponentSpec({
  id: 'card',
  displayName: 'Card',
  purpose: 'Grouped content surface with optional header and footer.',
  taxonomy: 'molecular',
  engineeringFamily: 'layout',
  complexity: 'moderate',
  status: 'stable',
  profile: 'layout',
});
