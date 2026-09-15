import { getGeneratedComponentSpec } from './spec-lookup';

export const alertSpec = getGeneratedComponentSpec({
  id: 'alert',
  displayName: 'Alert',
  purpose: 'Inline status message for contextual feedback.',
  taxonomy: 'molecular',
  engineeringFamily: 'feedback',
  complexity: 'simple',
  status: 'stable',
  profile: 'feedback',
});
