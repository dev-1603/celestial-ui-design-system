import { getGeneratedComponentSpec } from './spec-lookup';

export const dividerSpec = getGeneratedComponentSpec({
  id: 'divider',
  displayName: 'Divider',
  purpose: 'Non-semantic visual separator.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'minimal',
});
