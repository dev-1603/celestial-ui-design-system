import { getGeneratedComponentSpec } from './spec-lookup';

export const commandSpec = getGeneratedComponentSpec({
  id: 'command',
  displayName: 'Command',
  purpose: 'Searchable command palette over a collection.',
  taxonomy: 'organism',
  engineeringFamily: 'collections',
  complexity: 'complex',
  status: 'stable',
  profile: 'collection-command',
});
