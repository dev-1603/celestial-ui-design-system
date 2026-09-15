import { getGeneratedComponentSpec } from './spec-lookup';

export const transferListSpec = getGeneratedComponentSpec({
  id: 'transfer-list',
  displayName: 'Transfer List',
  purpose: 'Dual-list multi-select transfer control.',
  taxonomy: 'organism',
  engineeringFamily: 'collections',
  complexity: 'complex',
  status: 'stable',
  profile: 'collection-command',
});
