import { getGeneratedComponentSpec } from './spec-lookup';

export const tagSpec = getGeneratedComponentSpec({
  id: 'tag',
  displayName: 'Tag',
  purpose: 'Removable or static label chip.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
