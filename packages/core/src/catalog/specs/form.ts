import { getGeneratedComponentSpec } from './spec-lookup';

export const formSpec = getGeneratedComponentSpec({
  id: 'form',
  displayName: 'Form',
  purpose: 'Semantic grouping and submission of form fields.',
  taxonomy: 'organism',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-group',
});
