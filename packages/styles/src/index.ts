export { SEMANTIC_CSS_API_VERSION, STYLES_PACKAGE_VERSION } from './types';

export type {
  AppearanceMode,
  AttachOptions,
  AttributeCleanup,
  CompileThemeOptions,
  CompiledThemeCss,
  CompiledThemeMetadata,
  ModeBootstrapOptions,
  ModePreference,
  RenderStyleOptions,
  ResolvedTheme,
  ScheduleStrategy,
  ShadcnRegistry,
  StyleAttachment,
  StyleHydrationState,
  StyleScope,
  TailwindBridgeRegistry,
  ThemeDomState,
  ThemeStyleManager,
  ThemeStyleManagerOptions,
} from './types';

export type { StyleError, StyleErrorCode } from './errors';
export { StyleCompilationError, StyleRuntimeError, styleError } from './errors';

export { SEMANTIC_CSS_REGISTRY } from './semantic-registry';

export { tokenPathToVariableName } from './variable-registry';

export { compileResolvedTheme, compileThemeSet } from './compiler';

export {
  getScopeKey,
  validateScope,
  buildScopeSelector,
  getThemeAttributes,
  applyThemeAttributes,
  resolveScopeTarget,
} from './scope';

export { createThemeStyleManager, adoptHydratedStyle } from './runtime';

export {
  renderThemeStyleTag,
  createThemeHydrationState,
  createModeBootstrapScript,
  renderThemeRootAttributes,
} from './ssr';

export { DEFAULT_TAILWIND_BRIDGE, generateTailwindBridge } from './tailwind';

export { DEFAULT_SHADCN_REGISTRY, generateShadcnAdapter } from './shadcn';

export { generateBaseCss } from './base';
