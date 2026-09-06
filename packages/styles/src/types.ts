import type { ResolvedTheme } from '@celestial-ui/theme';

/** Stable semantic CSS API version (independent of package semver). */
export const SEMANTIC_CSS_API_VERSION = '1.0.0';

/** Celestial styles package version — mirrored in compiled metadata. */
export const STYLES_PACKAGE_VERSION = '0.1.0';

export type StyleScope =
  | { kind: 'document' }
  | { kind: 'application'; id: string }
  | { kind: 'sandbox'; id: string };

export type AppearanceMode = 'light' | 'dark';
export type ModePreference = AppearanceMode | 'system';

export interface ThemeDomState {
  themeId: string;
  mode: AppearanceMode;
  modePreference?: ModePreference;
  scope?: StyleScope;
}

export interface CompileThemeOptions {
  scope: StyleScope;
  /** Emit `--cui-{token-path}` compatibility variables (default: true). */
  includeCompatibilityVariables?: boolean;
  /** Emit stable semantic aliases (default: true). */
  includeSemanticVariables?: boolean;
  /** Include a metadata comment header (default: false). */
  includeMetadataComment?: boolean;
}

export interface CompiledThemeMetadata {
  themeId: string;
  themeVersion: string;
  mode: AppearanceMode;
  themeSchemaVersion: string;
  tokenSystemVersion: string;
  semanticCssApiVersion: string;
  stylesPackageVersion: string;
}

export interface CompiledThemeCss {
  /** Authoritative CSS for this compilation (all mode blocks for a theme set). */
  cssText: string;
  /**
   * Convenience variable map. For `compileResolvedTheme` this matches `cssText`.
   * For `compileThemeSet` this is last-mode-wins after sequential merge.
   */
  variables: Readonly<Record<string, string>>;
  selector: string;
  /** Deterministic style element id shared by SSR and runtime for this scope. */
  styleId: string;
  contentHash: string;
  metadata: CompiledThemeMetadata;
}

export type ScheduleStrategy = 'sync' | 'microtask' | 'animation-frame';

export interface ThemeStyleManagerOptions {
  document?: Document;
  nonce?: string;
  schedule?: ScheduleStrategy;
}

export interface AttachOptions {
  nonce?: string;
  target?: Element;
}

export interface StyleAttachment {
  scopeKey: string;
  styleElement: HTMLStyleElement;
  contentHash: string;
  generation: number;
}

export interface AttributeCleanup {
  remove(): void;
}

export interface ThemeStyleManager {
  attach(
    scope: StyleScope,
    compiled: CompiledThemeCss,
    options?: AttachOptions,
  ): StyleAttachment;
  update(attachment: StyleAttachment, compiled: CompiledThemeCss): void;
  detach(attachment: StyleAttachment): void;
  setState(target: Element, state: ThemeDomState): void;
  destroy(): void;
}

export interface RenderStyleOptions {
  id?: string;
  nonce?: string;
}

export interface StyleHydrationState {
  styleId: string;
  contentHash: string;
  themeId: string;
  mode: AppearanceMode;
  modePreference?: ModePreference;
  semanticCssApiVersion: string;
}

export interface ModeBootstrapOptions {
  themeId: string;
  defaultMode: AppearanceMode;
  /** `localStorage` key read by the inline bootstrap IIFE (default: `cui-mode`). */
  storageKey?: string;
}

export interface TailwindBridgeRegistry {
  readonly [key: string]: string;
}

export interface ShadcnRegistry {
  readonly [shadcnVar: string]: string;
}

export type { ResolvedTheme };
