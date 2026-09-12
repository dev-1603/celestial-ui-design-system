import { getGeneratedComponentSpec } from './spec-lookup';

export const labelSpec = getGeneratedComponentSpec({
  id: 'label',
  displayName: 'Label',
  purpose: 'Accessible label for a form control.',
  taxonomy: 'atomic',
  engineeringFamily: 'forms',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
