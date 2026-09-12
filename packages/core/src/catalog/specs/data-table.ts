import { getGeneratedComponentSpec } from './spec-lookup';

export const dataTableSpec = getGeneratedComponentSpec({
  id: 'data-table',
  displayName: 'Data Table',
  purpose: 'Tabular data with sorting, filtering, and selection.',
  taxonomy: 'organism',
  engineeringFamily: 'data-display',
  complexity: 'complex',
  status: 'stable',
  profile: 'data-table',
});
