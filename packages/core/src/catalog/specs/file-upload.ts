import { getGeneratedComponentSpec } from './spec-lookup';

export const fileUploadSpec = getGeneratedComponentSpec({
  id: 'file-upload',
  displayName: 'File Upload',
  purpose: 'File selection and upload control.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'complex',
  status: 'stable',
  profile: 'form-text',
});
