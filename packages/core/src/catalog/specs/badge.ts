import { getGeneratedComponentSpec } from './spec-lookup';

export const badgeSpec = getGeneratedComponentSpec({
  id: 'badge',
  displayName: 'Badge',
  purpose: 'Compact status or count indicator.',
  taxonomy: 'atomic',
  engineeringFamily: 'feedback',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
