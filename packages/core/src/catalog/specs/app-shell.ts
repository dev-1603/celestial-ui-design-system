import { getGeneratedComponentSpec } from './spec-lookup';

export const appShellSpec = getGeneratedComponentSpec({
  id: 'app-shell',
  displayName: 'App Shell',
  purpose: 'Application frame with nav and content regions.',
  taxonomy: 'template',
  engineeringFamily: 'templates',
  complexity: 'complex',
  status: 'stable',
  profile: 'template',
});
