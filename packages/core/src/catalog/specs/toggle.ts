import { getGeneratedComponentSpec } from './spec-lookup';

export const toggleSpec = getGeneratedComponentSpec({
  id: 'toggle',
  displayName: 'Toggle',
  purpose: 'Two-state pressed button control.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-action',
});
