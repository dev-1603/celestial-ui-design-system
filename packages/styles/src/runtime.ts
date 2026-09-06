import type {
  AttachOptions,
  CompiledThemeCss,
  ScheduleStrategy,
  StyleAttachment,
  StyleScope,
  ThemeDomState,
  ThemeStyleManager,
  ThemeStyleManagerOptions,
} from './types';
import { StyleRuntimeError } from './errors';
import { isValidCspNonce } from './serializer';
import {
  applyThemeAttributes,
  getScopeKey,
  registerScopeAttachment,
  unregisterScopeAttachment,
} from './scope';

const STYLE_ID_PREFIX = 'cui-style-';

function validateNonce(nonce?: string): void {
  if (nonce !== undefined && !isValidCspNonce(nonce)) {
    throw new StyleRuntimeError('CSP_NONCE_INVALID', 'Invalid CSP nonce format');
  }
}

function getDocument(options?: ThemeStyleManagerOptions): Document {
  if (options?.document) return options.document;
  if (typeof document !== 'undefined') return document;
  throw new StyleRuntimeError('DOM_UNAVAILABLE', 'Document is not available');
}

function schedule(
  strategy: ScheduleStrategy,
  fn: () => void,
): void {
  switch (strategy) {
    case 'sync':
      fn();
      break;
    case 'microtask':
      queueMicrotask(fn);
      break;
    case 'animation-frame':
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(fn);
      } else {
        queueMicrotask(fn);
      }
      break;
  }
}

interface AttachmentRecord {
  attachment: StyleAttachment;
  scope: StyleScope;
  generation: number;
}

export function createThemeStyleManager(
  options: ThemeStyleManagerOptions = {},
): ThemeStyleManager {
  if (options.nonce !== undefined) {
    validateNonce(options.nonce);
  }
  const doc = getDocument(options);
  const defaultNonce = options.nonce;
  const scheduleStrategy = options.schedule ?? 'microtask';
  const attachments = new Map<string, AttachmentRecord>();
  let destroyed = false;
  let globalGeneration = 0;

  function assertActive(): void {
    if (destroyed) {
      throw new StyleRuntimeError('STYLE_ATTACHMENT_FAILED', 'ThemeStyleManager has been destroyed');
    }
  }

  function styleElementId(scopeKey: string, compiled: CompiledThemeCss): string {
    return compiled.styleId || `${STYLE_ID_PREFIX}${scopeKey}`;
  }

  function createStyleElement(
    scopeKey: string,
    compiled: CompiledThemeCss,
    nonce?: string,
  ): HTMLStyleElement {
    const styleId = styleElementId(scopeKey, compiled);
    const existingEl = doc.getElementById(styleId);
    const style =
      existingEl && existingEl.tagName === 'STYLE'
        ? (existingEl as HTMLStyleElement)
        : doc.createElement('style');
    style.id = styleId;
    style.setAttribute('data-cui-hash', compiled.contentHash);
    style.setAttribute('data-cui-theme', compiled.metadata.themeId);
    style.setAttribute('data-cui-mode', compiled.metadata.mode);
    const effectiveNonce = nonce ?? defaultNonce;
    if (effectiveNonce) {
      validateNonce(effectiveNonce);
      style.setAttribute('nonce', effectiveNonce);
    }
    style.textContent = compiled.cssText;
    return style;
  }

  return {
    attach(scope: StyleScope, compiled: CompiledThemeCss, attachOptions?: AttachOptions): StyleAttachment {
      assertActive();
      const scopeKey = getScopeKey(scope);
      const nonce = attachOptions?.nonce ?? defaultNonce;

      const existing = attachments.get(scopeKey);
      if (existing && existing.attachment.contentHash === compiled.contentHash) {
        return existing.attachment;
      }

      const generation = ++globalGeneration;

      let styleEl: HTMLStyleElement;

      if (existing) {
        styleEl = existing.attachment.styleElement;
        styleEl.textContent = compiled.cssText;
        styleEl.setAttribute('data-cui-hash', compiled.contentHash);
      } else {
        registerScopeAttachment(scope);
        styleEl = createStyleElement(scopeKey, compiled, nonce);
        if (!styleEl.parentNode) {
          const target = attachOptions?.target ?? doc.head ?? doc.documentElement;
          target.appendChild(styleEl);
        }
      }

      const attachment: StyleAttachment = {
        scopeKey,
        styleElement: styleEl,
        contentHash: compiled.contentHash,
        generation,
      };

      attachments.set(scopeKey, { attachment, scope, generation });
      return attachment;
    },

    update(attachment: StyleAttachment, compiled: CompiledThemeCss): void {
      assertActive();
      if (attachment.contentHash === compiled.contentHash) return;

      const record = attachments.get(attachment.scopeKey);
      const gen = ++globalGeneration;
      const run = () => {
        if (record && record.generation > gen) return;
        attachment.styleElement.textContent = compiled.cssText;
        attachment.styleElement.setAttribute('data-cui-hash', compiled.contentHash);
        attachment.contentHash = compiled.contentHash;
        attachment.generation = gen;
        if (record) record.generation = gen;
      };

      schedule(scheduleStrategy, run);
    },

    detach(attachment: StyleAttachment): void {
      assertActive();
      const record = attachments.get(attachment.scopeKey);
      if (record) {
        unregisterScopeAttachment(record.scope);
        attachment.styleElement.remove();
        attachments.delete(attachment.scopeKey);
      }
    },

    setState(target: Element, state: ThemeDomState): void {
      assertActive();
      applyThemeAttributes(target, state);
    },

    destroy(): void {
      for (const [, record] of attachments) {
        unregisterScopeAttachment(record.scope);
        record.attachment.styleElement.remove();
      }
      attachments.clear();
      destroyed = true;
    },
  };
}

/** Adopt an existing SSR-injected style element during hydration. */
export function adoptHydratedStyle(
  doc: Document,
  hydration: { styleId: string; contentHash: string },
): HTMLStyleElement | null {
  const el = doc.getElementById(hydration.styleId);
  if (!el || el.tagName !== 'STYLE') return null;
  const hash = el.getAttribute('data-cui-hash');
  if (hash === hydration.contentHash) {
    return el as HTMLStyleElement;
  }
  throw new StyleRuntimeError(
    'SSR_HYDRATION_MISMATCH',
    `Style hash mismatch: expected ${hydration.contentHash}, got ${hash ?? 'none'}`,
  );
}
