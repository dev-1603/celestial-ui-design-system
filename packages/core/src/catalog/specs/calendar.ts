import { getGeneratedComponentSpec } from './spec-lookup';

export const calendarSpec = getGeneratedComponentSpec({
  id: 'calendar',
  displayName: 'Calendar',
  purpose: 'Date grid for selecting dates or ranges.',
  taxonomy: 'organism',
  engineeringFamily: 'editors',
  complexity: 'complex',
  status: 'stable',
  profile: 'editor-shell',
});
