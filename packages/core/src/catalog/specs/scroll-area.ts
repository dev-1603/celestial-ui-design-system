import { getGeneratedComponentSpec } from './spec-lookup';

export const scrollAreaSpec = getGeneratedComponentSpec({
  id: 'scroll-area',
  displayName: 'Scroll Area',
  purpose: 'Custom scrollable viewport with overflow.',
  taxonomy: 'molecular',
  engineeringFamily: 'layout',
  complexity: 'moderate',
  status: 'stable',
  profile: 'layout',
});
