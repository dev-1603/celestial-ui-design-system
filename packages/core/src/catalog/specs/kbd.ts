import { getGeneratedComponentSpec } from './spec-lookup';

export const kbdSpec = getGeneratedComponentSpec({
  id: 'kbd',
  displayName: 'Kbd',
  purpose: 'Keyboard key or shortcut representation.',
  taxonomy: 'atomic',
  engineeringFamily: 'primitives',
  complexity: 'simple',
  status: 'stable',
  profile: 'primitive-display',
});
