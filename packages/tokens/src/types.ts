export type TokenLayer = 'primitive' | 'foundation' | 'semantic' | 'component';

export type OverridePolicy =
  | 'locked'
  | 'themeable'
  | 'tenantOverridable'
  | 'componentOverridable';

/** Version of the canonical token system (package version). */
export const TOKEN_SYSTEM_VERSION = '0.1.0';

export type TokenType = 
  | 'color' 
  | 'dimension' 
  | 'fontFamily' 
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'duration' 
  | 'cubicBezier' 
  | 'number' 
  | 'strokeStyle' 
  | 'border' 
  | 'stroke' 
  | 'shadow' 
  | 'gradient' 
  | 'transition' 
  | 'typography';

export interface CelestialExtensions {
  /** Does this token require contrast checks? */
  a11ySensitive?: boolean;
  /** Background tokens to check contrast against. e.g. ["surface.canvas", "surface.elevated"] */
  contrastPairs?: string[];
  /** Can a tenant override this in a theme? */
  themeable?: boolean;
  /** Explicit override policy; when omitted, theme package derives policy from layer/themeable. */
  overridePolicy?: OverridePolicy;
  /** Is this a stable public API? */
  public?: boolean;
  /** If deprecated, the migration path or string */
  deprecated?: boolean | string;
  /** The architectural layer of this token */
  layer: TokenLayer;
}

export interface TypographyValue {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string | number;
  letterSpacing?: string;
}

export interface BorderValue {
  color: string;
  width: string;
  style: string;
}

export interface ShadowValue {
  color: string;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  inset?: boolean;
}

export type TokenValue = 
  | string 
  | number 
  | TypographyValue 
  | BorderValue 
  | ShadowValue 
  | ShadowValue[];

export interface Token<TValue = TokenValue> {
  $type: TokenType;
  $value: TValue;
  $description?: string;
  $extensions?: {
    celestial?: CelestialExtensions;
    [key: string]: any;
  };
}

export interface TokenGroup {
  $type?: TokenType;
  $description?: string;
  $extensions?: {
    celestial?: Partial<CelestialExtensions>;
    [key: string]: any;
  };
  [key: string]: Token | TokenGroup | any; // 'any' for $type/$description
}

export interface TokenConfig {
  [category: string]: TokenGroup;
}

/** Token data grouped by appearance mode (light/dark overlays). */
export interface TokenModeBundle {
  name: string;
  modes: {
    [modeName: string]: TokenConfig;
  };
}

/**
 * @deprecated Use `TokenModeBundle` — theme identity lives in `@celestial-ui/theme`.
 */
export type ThemeConfig = TokenModeBundle;

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
