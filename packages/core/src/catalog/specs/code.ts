import { getGeneratedComponentSpec } from './spec-lookup';

export const codeSpec = getGeneratedComponentSpec({
  id: 'code',
  displayName: 'Code',
  purpose: 'Inline or block code presentation.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
