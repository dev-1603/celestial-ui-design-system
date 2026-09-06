/**
 * Icon provider configuration for themes and tenant profiles.
 *
 * This package defines **configuration only** — not rendering.
 * Icon resolution, adapters, and SVG sanitization belong in
 * `@celestial-ui/icons`.
 *
 * Known provider IDs (non-exhaustive — `@celestial-ui/icons` owns the built-in
 * set; theme accepts any string to avoid a circular dependency):
 * - 'lucide'
 * - 'fa'            (Font Awesome Free; Pro is application-owned)
 * - 'material'      (Google Material Symbols)
 * - 'heroicons'
 * - 'phosphor'
 * - 'iconify'       (aggregation provider)
 *
 * There is no first-party `celestial` icon provider until a licensed set ships.
 * Tenants may still register a custom adapter under any unused provider id.
 *
 * Security: Theme must never execute arbitrary SVG, HTML, or JavaScript.
 * Custom providers accept asset references (URLs/paths) only — not raw markup.
 * Sanitization happens in the icon/asset layer at render time.
 */

/**
 * Stable provider identifier string.
 *
 * The canonical set of built-in provider IDs is defined in
 * `@celestial-ui/icons` as `BuiltInProviderId`. Theme accepts any string
 * here to remain decoupled from the icons package.
 */
export type IconProvider = string;

export interface IconProviderConfig {
  provider: IconProvider;
  /** Provider-specific options (e.g. Iconify collection ID, FA kit ID). */
  options?: Record<string, string | number | boolean>;
}
