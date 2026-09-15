import { getGeneratedComponentSpec } from './spec-lookup';

export const noticeSpec = getGeneratedComponentSpec({
  id: 'notice',
  displayName: 'Notice',
  purpose: 'Informational inline notice banner.',
  taxonomy: 'molecular',
  engineeringFamily: 'feedback',
  complexity: 'simple',
  status: 'stable',
  profile: 'feedback',
});
