import { getGeneratedComponentSpec } from './spec-lookup';

export const textSpec = getGeneratedComponentSpec({
  id: 'text',
  displayName: 'Text',
  purpose: 'Semantic text content with typographic variants.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
