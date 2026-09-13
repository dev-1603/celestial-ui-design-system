import { getGeneratedComponentSpec } from './spec-lookup';

export const treeSpec = getGeneratedComponentSpec({
  id: 'tree',
  displayName: 'Tree',
  purpose: 'Hierarchical expandable node tree.',
  taxonomy: 'organism',
  engineeringFamily: 'collections',
  complexity: 'complex',
  status: 'stable',
  profile: 'collection-tree',
});
