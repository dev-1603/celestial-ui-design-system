import { getGeneratedComponentSpec } from './spec-lookup';

export const chipSpec = getGeneratedComponentSpec({
  id: 'chip',
  displayName: 'Chip',
  purpose: 'Compact interactive token or filter.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
