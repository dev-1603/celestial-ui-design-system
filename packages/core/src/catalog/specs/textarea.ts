import { getGeneratedComponentSpec } from './spec-lookup';

export const textareaSpec = getGeneratedComponentSpec({
  id: 'textarea',
  displayName: 'Textarea',
  purpose: 'Multi-line text input control.',
  taxonomy: 'atomic',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
