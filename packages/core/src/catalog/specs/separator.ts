import { getGeneratedComponentSpec } from './spec-lookup';

export const separatorSpec = getGeneratedComponentSpec({
  id: 'separator',
  displayName: 'Separator',
  purpose: 'Visual divider between content regions.',
  taxonomy: 'atomic',
  engineeringFamily: 'layout',
  complexity: 'simple',
  status: 'stable',
  profile: 'minimal',
});
