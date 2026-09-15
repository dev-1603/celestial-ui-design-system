import { getGeneratedComponentSpec } from './spec-lookup';

export const headingSpec = getGeneratedComponentSpec({
  id: 'heading',
  displayName: 'Heading',
  purpose: 'Semantic heading levels for document structure.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
