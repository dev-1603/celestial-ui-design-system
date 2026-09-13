import { getGeneratedComponentSpec } from './spec-lookup';

export const breadcrumbSpec = getGeneratedComponentSpec({
  id: 'breadcrumb',
  displayName: 'Breadcrumb',
  purpose: 'Hierarchical navigation trail for current location.',
  taxonomy: 'molecular',
  engineeringFamily: 'navigation',
  complexity: 'moderate',
  status: 'stable',
  profile: 'navigation',
});
