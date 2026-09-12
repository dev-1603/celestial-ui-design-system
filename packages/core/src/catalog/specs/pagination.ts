import { getGeneratedComponentSpec } from './spec-lookup';

export const paginationSpec = getGeneratedComponentSpec({
  id: 'pagination',
  displayName: 'Pagination',
  purpose: 'Navigate paged collections of content.',
  taxonomy: 'molecular',
  engineeringFamily: 'navigation',
  complexity: 'moderate',
  status: 'stable',
  profile: 'navigation',
});
