import { THEME_SCHEMA_VERSION, type ThemeConfig } from '../types';

export const CELESTIAL_THEME: ThemeConfig = {
  id: 'celestial',
  name: 'Celestial',
  version: '1.0.0',
  schemaVersion: THEME_SCHEMA_VERSION,
  defaultMode: 'light',
  modes: ['light', 'dark'],
};
