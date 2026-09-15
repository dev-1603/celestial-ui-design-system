import { getGeneratedComponentSpec } from './spec-lookup';

export const chartSpec = getGeneratedComponentSpec({
  id: 'chart',
  displayName: 'Chart',
  purpose: 'Data visualization shell without chart engine.',
  taxonomy: 'organism',
  engineeringFamily: 'data-display',
  complexity: 'complex',
  status: 'stable',
  profile: 'editor-shell',
});
