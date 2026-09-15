import { getGeneratedComponentSpec } from './spec-lookup';

export const calloutSpec = getGeneratedComponentSpec({
  id: 'callout',
  displayName: 'Callout',
  purpose: 'Highlighted informational block.',
  taxonomy: 'molecular',
  engineeringFamily: 'feedback',
  complexity: 'simple',
  status: 'stable',
  profile: 'feedback',
});
