import type { StyleScope } from './types';
import type { AppearanceMode } from './types';
import { buildScopeSelector } from './scope';

export interface GenerateBaseOptions {
  scope?: StyleScope;
  themeId?: string;
  mode?: AppearanceMode;
}

/**
 * Minimal opt-in base/accessibility layer.
 * No global reset — only color-scheme, reduced-motion, forced-colors, and focus primitives.
 */
export function generateBaseCss(options: GenerateBaseOptions = {}): string {
  const scope = options.scope ?? { kind: 'document' };
  const themeId = options.themeId ?? 'celestial';
  const mode = options.mode ?? 'light';
  const selector = buildScopeSelector(scope, themeId, mode);

  return `/* Celestial base — @celestial-ui/styles/base */
@layer celestial.base {
  ${selector} {
    color-scheme: ${mode};
  }

  @media (prefers-reduced-motion: reduce) {
    ${selector} {
      /* Shared motion primitive only — components own animation behavior. */
      --cui-motion-duration-fast: 0.01ms;
      --cui-motion-duration-normal: 0.01ms;
      --cui-motion-duration-slow: 0.01ms;
    }
  }

  @media (forced-colors: active) {
    ${selector} {
      --cui-focus-ring: Highlight;
      --cui-border: CanvasText;
    }
  }

  ${selector} :focus-visible {
    outline: 2px solid var(--cui-focus-ring);
    outline-offset: 2px;
  }
}
`;
}
