import { getGeneratedComponentSpec } from './spec-lookup';

export const sheetSpec = getGeneratedComponentSpec({
  id: 'sheet',
  displayName: 'Sheet',
  purpose: 'Slide-over panel overlay from screen edge.',
  taxonomy: 'organism',
  engineeringFamily: 'overlays',
  complexity: 'moderate',
  status: 'stable',
  profile: 'overlay-modal',
});
