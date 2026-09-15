import { getGeneratedComponentSpec } from './spec-lookup';

export const toastSpec = getGeneratedComponentSpec({
  id: 'toast',
  displayName: 'Toast',
  purpose: 'Transient notification message.',
  taxonomy: 'molecular',
  engineeringFamily: 'feedback',
  complexity: 'moderate',
  status: 'stable',
  profile: 'feedback',
});
