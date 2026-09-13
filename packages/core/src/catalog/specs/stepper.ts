import { getGeneratedComponentSpec } from './spec-lookup';

export const stepperSpec = getGeneratedComponentSpec({
  id: 'stepper',
  displayName: 'Stepper',
  purpose: 'Sequential step navigation control.',
  taxonomy: 'organism',
  engineeringFamily: 'navigation',
  complexity: 'complex',
  status: 'stable',
  profile: 'navigation',
});
