import { getGeneratedComponentSpec } from './spec-lookup';

export const linkSpec = getGeneratedComponentSpec({
  id: 'link',
  displayName: 'Link',
  purpose: 'Navigational hyperlink control.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-action',
});
