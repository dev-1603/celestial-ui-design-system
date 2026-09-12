import { getGeneratedComponentSpec } from './spec-lookup';

export const alertDialogSpec = getGeneratedComponentSpec({
  id: 'alert-dialog',
  displayName: 'Alert Dialog',
  purpose: 'Modal confirmation requiring explicit user decision.',
  taxonomy: 'organism',
  engineeringFamily: 'overlays',
  complexity: 'moderate',
  status: 'stable',
  profile: 'overlay-modal',
});
