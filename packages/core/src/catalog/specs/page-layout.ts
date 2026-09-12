import { getGeneratedComponentSpec } from './spec-lookup';

export const pageLayoutSpec = getGeneratedComponentSpec({
  id: 'page-layout',
  displayName: 'Page Layout',
  purpose: 'Standard page content scaffold.',
  taxonomy: 'template',
  engineeringFamily: 'templates',
  complexity: 'moderate',
  status: 'stable',
  profile: 'template',
});
