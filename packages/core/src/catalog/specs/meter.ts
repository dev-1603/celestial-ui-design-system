import { getGeneratedComponentSpec } from './spec-lookup';

export const meterSpec = getGeneratedComponentSpec({
  id: 'meter',
  displayName: 'Meter',
  purpose: 'Scalar measurement within known range.',
  taxonomy: 'atomic',
  engineeringFamily: 'feedback',
  complexity: 'simple',
  status: 'stable',
  profile: 'feedback',
});
