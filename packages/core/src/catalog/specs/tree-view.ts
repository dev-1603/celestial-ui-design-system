import { getGeneratedComponentSpec } from './spec-lookup';

export const treeViewSpec = getGeneratedComponentSpec({
  id: 'tree-view',
  displayName: 'Tree View',
  purpose: 'Selectable hierarchical tree collection.',
  taxonomy: 'organism',
  engineeringFamily: 'collections',
  complexity: 'complex',
  status: 'stable',
  profile: 'collection-tree',
});
