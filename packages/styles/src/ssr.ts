import type {
  CompiledThemeCss,
  ModeBootstrapOptions,
  RenderStyleOptions,
  StyleHydrationState,
  ThemeDomState,
} from './types';
import { SEMANTIC_CSS_API_VERSION } from './types';
import { StyleRuntimeError } from './errors';
import { escapeHtmlAttribute, isValidCspNonce } from './serializer';
import { getThemeAttributes } from './scope';

export { getThemeAttributes, applyThemeAttributes } from './scope';

export function renderThemeStyleTag(
  compiled: CompiledThemeCss,
  options: RenderStyleOptions = {},
): string {
  if (options.nonce !== undefined && !isValidCspNonce(options.nonce)) {
    throw new StyleRuntimeError('CSP_NONCE_INVALID', 'Invalid CSP nonce format');
  }
  const id = options.id ?? compiled.styleId;
  const nonceAttr = options.nonce
    ? ` nonce="${escapeHtmlAttribute(options.nonce)}"`
    : '';
  const safeCss = compiled.cssText.replace(/<\/style/gi, '<\\/style');
  return `<style id="${escapeHtmlAttribute(id)}" data-cui-hash="${escapeHtmlAttribute(compiled.contentHash)}" data-cui-theme="${escapeHtmlAttribute(compiled.metadata.themeId)}" data-cui-mode="${escapeHtmlAttribute(compiled.metadata.mode)}"${nonceAttr}>${safeCss}</style>`;
}

export function createThemeHydrationState(
  compiled: CompiledThemeCss,
  state: ThemeDomState,
): StyleHydrationState {
  return {
    styleId: compiled.styleId,
    contentHash: compiled.contentHash,
    themeId: state.themeId,
    mode: state.mode,
    modePreference: state.modePreference,
    semanticCssApiVersion: SEMANTIC_CSS_API_VERSION,
  };
}

function escapeJsonString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

const THEME_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;
const STORAGE_KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{0,127}$/;

/**
 * Fixed bootstrap script for system mode preference.
 * Runs before paint to set data-cui-mode and compatibility class.
 */
export function createModeBootstrapScript(options: ModeBootstrapOptions): string {
  const { themeId, defaultMode } = options;
  const storageKey = options.storageKey ?? 'cui-mode';

  if (!THEME_ID_PATTERN.test(themeId)) {
    throw new StyleRuntimeError('INVALID_SCOPE', `Invalid themeId for bootstrap: ${themeId}`);
  }
  if (!STORAGE_KEY_PATTERN.test(storageKey)) {
    throw new StyleRuntimeError('INVALID_SCOPE', `Invalid storageKey for bootstrap: ${storageKey}`);
  }
  if (defaultMode !== 'light' && defaultMode !== 'dark') {
    throw new StyleRuntimeError('INVALID_SCOPE', `Invalid defaultMode: ${defaultMode}`);
  }

  const safeThemeId = escapeJsonString(themeId);
  const safeKey = escapeJsonString(storageKey);
  const safeDefault = escapeJsonString(defaultMode);

  return `(function(){try{var k="${safeKey}";var stored=null;try{stored=localStorage.getItem(k);}catch(e){}var explicit=stored==="light"||stored==="dark";var mode=explicit?stored:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"${safeDefault}");var pref=explicit?stored:"system";var root=document.documentElement;root.setAttribute("data-cui-theme","${safeThemeId}");root.setAttribute("data-cui-mode",mode);root.setAttribute("data-cui-mode-preference",pref);root.classList.remove("light","dark");root.classList.add(mode);}catch(e){}})();`;
}

export function renderThemeRootAttributes(state: ThemeDomState): string {
  const attrs = getThemeAttributes(state);
  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${escapeHtmlAttribute(v)}"`)
    .join(' ');
}
