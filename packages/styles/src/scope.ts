import type { AppearanceMode, StyleScope, ThemeDomState } from './types';
import { escapeCssSelectorValue } from './serializer';
import { StyleRuntimeError } from './errors';

export function getScopeKey(scope: StyleScope): string {
  switch (scope.kind) {
    case 'document':
      return 'document';
    case 'application':
      return `application:${scope.id}`;
    case 'sandbox':
      return `sandbox:${scope.id}`;
  }
}

export function validateScopeId(id: string): void {
  if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(id)) {
    throw new StyleRuntimeError(
      'INVALID_SCOPE',
      `Invalid scope id "${id}": must be alphanumeric with hyphens/underscores, 1-64 chars`,
    );
  }
}

export function validateScope(scope: StyleScope): void {
  if (scope.kind === 'application' || scope.kind === 'sandbox') {
    validateScopeId(scope.id);
  }
}

/**
 * Build the CSS selector for a scoped theme/mode block.
 * Uses :where() for low specificity.
 */
export function buildScopeSelector(
  scope: StyleScope,
  themeId: string,
  mode: AppearanceMode,
): string {
  validateScope(scope);
  const escapedTheme = escapeCssSelectorValue(themeId);
  const modeAttr = `[data-cui-mode="${mode}"]`;

  switch (scope.kind) {
    case 'document': {
      const dataSelector = `:root[data-cui-theme="${escapedTheme}"]${modeAttr}`;
      const compatClass = mode === 'light' ? ':root.light' : ':root.dark';
      const legacyClass = mode === 'light' ? '.light' : '.dark';
      return `:where(${dataSelector}, ${compatClass}, ${legacyClass})`;
    }
    case 'application': {
      const escapedId = escapeCssSelectorValue(scope.id);
      return `:where([data-cui-root="${escapedId}"][data-cui-theme="${escapedTheme}"]${modeAttr})`;
    }
    case 'sandbox': {
      const escapedId = escapeCssSelectorValue(scope.id);
      return `:where([data-cui-sandbox="${escapedId}"][data-cui-theme="${escapedTheme}"]${modeAttr})`;
    }
  }
}

export function getThemeAttributes(state: ThemeDomState): Record<string, string> {
  const attrs: Record<string, string> = {
    'data-cui-theme': state.themeId,
    'data-cui-mode': state.mode,
  };

  if (state.modePreference) {
    attrs['data-cui-mode-preference'] = state.modePreference;
  }

  if (state.scope?.kind === 'application') {
    attrs['data-cui-root'] = state.scope.id;
  } else if (state.scope?.kind === 'sandbox') {
    attrs['data-cui-sandbox'] = state.scope.id;
  }

  return attrs;
}

export function applyThemeAttributes(target: Element, state: ThemeDomState): { remove(): void } {
  const attrs = getThemeAttributes(state);
  const previous: Record<string, string | null> = {};

  for (const [key, value] of Object.entries(attrs)) {
    previous[key] = target.getAttribute(key);
    target.setAttribute(key, value);
  }

  const compatClass = state.mode === 'light' ? 'light' : 'dark';
  const hadLight = target.classList.contains('light');
  const hadDark = target.classList.contains('dark');
  target.classList.remove('light', 'dark');
  target.classList.add(compatClass);

  return {
    remove() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === null) {
          target.removeAttribute(key);
        } else {
          target.setAttribute(key, value);
        }
      }
      target.classList.remove('light', 'dark');
      if (hadLight) target.classList.add('light');
      if (hadDark) target.classList.add('dark');
    },
  };
}

const activeApplicationRoots = new Set<string>();
const activeSandboxes = new Set<string>();

export function registerScopeAttachment(scope: StyleScope): void {
  if (scope.kind === 'application') {
    if (activeApplicationRoots.has(scope.id)) {
      throw new StyleRuntimeError(
        'SCOPE_NESTING_INVALID',
        `Nested or duplicate application root "${scope.id}" is not allowed`,
        scope,
      );
    }
    activeApplicationRoots.add(scope.id);
  }
  if (scope.kind === 'sandbox') {
    if (activeSandboxes.has(scope.id)) {
      throw new StyleRuntimeError(
        'SCOPE_NESTING_INVALID',
        `Nested or duplicate sandbox "${scope.id}" is not allowed`,
        scope,
      );
    }
    activeSandboxes.add(scope.id);
  }
}

export function unregisterScopeAttachment(scope: StyleScope): void {
  if (scope.kind === 'application') {
    activeApplicationRoots.delete(scope.id);
  }
  if (scope.kind === 'sandbox') {
    activeSandboxes.delete(scope.id);
  }
}

export function clearScopeRegistry(): void {
  activeApplicationRoots.clear();
  activeSandboxes.clear();
}

export function resolveScopeTarget(doc: Document, scope: StyleScope): Element {
  switch (scope.kind) {
    case 'document':
      return doc.documentElement;
    case 'application': {
      const el = doc.querySelector(`[data-cui-root="${scope.id}"]`);
      if (!el) {
        throw new StyleRuntimeError(
          'STYLE_ATTACHMENT_FAILED',
          `Application root [data-cui-root="${scope.id}"] not found`,
          scope,
        );
      }
      return el;
    }
    case 'sandbox': {
      const el = doc.querySelector(`[data-cui-sandbox="${scope.id}"]`);
      if (!el) {
        throw new StyleRuntimeError(
          'STYLE_ATTACHMENT_FAILED',
          `Sandbox [data-cui-sandbox="${scope.id}"] not found`,
          scope,
        );
      }
      return el;
    }
  }
}
