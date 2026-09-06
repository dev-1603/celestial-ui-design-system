import type { AppearanceMode, ModePreference, ThemeConfig } from './types';

/**
 * Resolves the effective appearance mode for a theme.
 *
 * - Explicit `mode` wins over `modePreference`.
 * - `modePreference: 'system'` requires the caller to pass `systemResolvedMode`
 *   (from OS/browser preference). It is never a third visual token overlay.
 */
export function resolveAppearanceMode(
  theme: ThemeConfig,
  options: {
    mode?: AppearanceMode;
    modePreference?: ModePreference;
    systemResolvedMode?: AppearanceMode;
  },
): AppearanceMode {
  if (options.mode) {
    return options.mode;
  }

  if (options.modePreference === 'light' || options.modePreference === 'dark') {
    return options.modePreference;
  }

  if (options.modePreference === 'system') {
    return options.systemResolvedMode ?? theme.defaultMode;
  }

  return theme.defaultMode;
}
