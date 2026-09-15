import { getGeneratedComponentSpec } from './spec-lookup';

export const blockquoteSpec = getGeneratedComponentSpec({
  id: 'blockquote',
  displayName: 'Blockquote',
  purpose: 'Quoted content block.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
