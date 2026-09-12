import { getGeneratedComponentSpec } from './spec-lookup';

export const accordionSpec = getGeneratedComponentSpec({
  id: 'accordion',
  displayName: 'Accordion',
  purpose: 'Expandable sections with one or many panels open.',
  taxonomy: 'molecular',
  engineeringFamily: 'collections',
  complexity: 'moderate',
  status: 'stable',
  profile: 'collection-disclosure',
});
