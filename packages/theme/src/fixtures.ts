import { THEME_SCHEMA_VERSION, type ThemeConfig } from './types';

export const ACME_THEME: ThemeConfig = {
  id: 'acme',
  name: 'Acme',
  version: '1.0.0',
  schemaVersion: THEME_SCHEMA_VERSION,
  parentId: 'celestial',
  defaultMode: 'light',
  modes: ['light', 'dark'],
  overrides: {
    'action.primary.background': '{color.blue.700}',
  },
};

export const ACME_NEXUS_THEME: ThemeConfig = {
  id: 'acme-nexus',
  name: 'Acme Nexus',
  version: '1.0.0',
  schemaVersion: THEME_SCHEMA_VERSION,
  parentId: 'acme',
  defaultMode: 'light',
  modes: ['light', 'dark'],
  overrides: {
    'action.primary.hover': '{color.blue.800}',
  },
};
