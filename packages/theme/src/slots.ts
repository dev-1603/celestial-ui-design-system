import type { OverridePolicy } from '@celestial-ui/tokens';
import type { ThemeSlotDefinition, ThemeSlotId } from './types';

/**
 * Formal theme slot definitions (V1 contract).
 *
 * Override precedence (higher wins when policy allows):
 *   canonical → mode → inherited theme → leaf theme → tenant slot override
 *
 * Policies are permission levels, not precedence order.
 */
export const THEME_SLOT_DEFINITIONS: Record<ThemeSlotId, ThemeSlotDefinition> = {
  brand: {
    id: 'brand',
    description: 'Primary brand actions, secondary actions, and links.',
    allowedTokenPaths: ['action.primary.', 'action.secondary.', 'link.'],
    allowedOverridePolicies: ['tenantOverridable'],
  },
  typography: {
    id: 'typography',
    description: 'Font families, sizes, weights, and typography composites.',
    allowedTokenPaths: [
      'fontFamily.',
      'fontSize.',
      'fontWeight.',
      'lineHeight.',
      'letterSpacing.',
      'typography.',
    ],
    allowedOverridePolicies: ['themeable', 'tenantOverridable'],
  },
  shape: {
    id: 'shape',
    description: 'Border radius foundation tokens.',
    allowedTokenPaths: ['radius.'],
    allowedOverridePolicies: ['themeable'],
  },
  density: {
    id: 'density',
    description: 'Density scale tokens (not raw spacing grid).',
    allowedTokenPaths: ['density.'],
    allowedOverridePolicies: ['themeable'],
  },
  color: {
    id: 'color',
    description: 'Semantic color tokens for actions, text, borders, and status.',
    allowedTokenPaths: [
      'action.',
      'status.',
      'text.',
      'border.',
      'icon.',
      'selection.',
    ],
    allowedOverridePolicies: ['tenantOverridable'],
  },
  surface: {
    id: 'surface',
    description: 'Surface and canvas background semantics.',
    allowedTokenPaths: ['surface.'],
    allowedOverridePolicies: ['tenantOverridable'],
  },
  elevation: {
    id: 'elevation',
    description: 'Shadow and elevation foundation tokens.',
    allowedTokenPaths: ['shadow.'],
    allowedOverridePolicies: ['themeable'],
  },
  motion: {
    id: 'motion',
    description: 'Duration and easing motion tokens.',
    allowedTokenPaths: ['motion.'],
    allowedOverridePolicies: ['themeable'],
  },
  accessibility: {
    id: 'accessibility',
    description: 'Accessibility invariants — locked in V1.',
    allowedTokenPaths: [],
    allowedOverridePolicies: [],
  },
  icons: {
    id: 'icons',
    description: 'Icon color semantics.',
    allowedTokenPaths: ['icon.'],
    allowedOverridePolicies: ['tenantOverridable'],
  },
};

const COMPONENT_PATH_PREFIXES = ['button.', 'input.'] as const;

/** @deprecated Use `THEME_SLOT_DEFINITIONS`. */
export const THEME_SLOTS: Record<
  ThemeSlotId,
  { id: ThemeSlotId; pathPrefixes: readonly string[] }
> = Object.fromEntries(
  Object.entries(THEME_SLOT_DEFINITIONS).map(([id, def]) => [
    id,
    { id: def.id, pathPrefixes: def.allowedTokenPaths },
  ]),
) as Record<ThemeSlotId, { id: ThemeSlotId; pathPrefixes: readonly string[] }>;

export const THEME_SLOT_IDS = Object.keys(THEME_SLOT_DEFINITIONS) as ThemeSlotId[];

export function isPathInSlot(tokenPath: string, slotId: ThemeSlotId): boolean {
  const slot = THEME_SLOT_DEFINITIONS[slotId];
  return slot.allowedTokenPaths.some((prefix) => tokenPath.startsWith(prefix));
}

export function isPolicyAllowedInSlot(
  policy: OverridePolicy,
  slotId: ThemeSlotId,
): boolean {
  return THEME_SLOT_DEFINITIONS[slotId].allowedOverridePolicies.includes(policy);
}

export function isComponentPath(tokenPath: string): boolean {
  return COMPONENT_PATH_PREFIXES.some((prefix) => tokenPath.startsWith(prefix));
}

export function findSlotForPath(tokenPath: string): ThemeSlotId | undefined {
  return THEME_SLOT_IDS.find((slotId) => isPathInSlot(tokenPath, slotId));
}
