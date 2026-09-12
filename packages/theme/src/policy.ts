import type { OverridePolicy, Token } from '@celestial-ui/tokens';
import { isComponentPath } from './slots';

const LOCKED_PREFIXES = ['space.', 'focus.'] as const;

/**
 * Override policy semantics (permission levels — not precedence):
 *
 * - `locked` — cannot be overridden by theme authors or tenants.
 * - `themeable` — theme author may override during inheritance.
 * - `tenantOverridable` — tenant may override through an approved slot.
 * - `componentOverridable` — approved component customization paths only.
 *
 * A token participates in one effective policy at enforcement time.
 * Precedence of layers is handled separately in the resolver.
 */
export function getEffectivePolicy(tokenPath: string, token: Token): OverridePolicy {
  const ext = token.$extensions?.celestial;

  if (ext?.overridePolicy) {
    return ext.overridePolicy;
  }

  if (LOCKED_PREFIXES.some((prefix) => tokenPath.startsWith(prefix))) {
    return 'locked';
  }

  if (ext?.layer === 'primitive') {
    return 'locked';
  }

  if (isComponentPath(tokenPath)) {
    return 'componentOverridable';
  }

  if (ext?.themeable === true) {
    return 'tenantOverridable';
  }

  if (ext?.layer === 'foundation') {
    return ext.themeable ? 'themeable' : 'locked';
  }

  if (ext?.layer === 'semantic') {
    return 'locked';
  }

  return 'locked';
}

/** Theme inheritance layer may override when policy is not locked. */
export function canThemeOverride(tokenPath: string, token: Token): boolean {
  const policy = getEffectivePolicy(tokenPath, token);
  return (
    policy === 'themeable' || policy === 'tenantOverridable' || policy === 'componentOverridable'
  );
}

/** Tenant layer may override only through approved slots and policies. */
export function canTenantOverride(
  tokenPath: string,
  token: Token,
  slotAllowed: boolean,
  policyAllowedInSlot: boolean,
): boolean {
  const policy = getEffectivePolicy(tokenPath, token);

  if (policy === 'locked' || policy === 'themeable') {
    return false;
  }

  if (!policyAllowedInSlot) {
    return false;
  }

  if (policy === 'componentOverridable') {
    return isComponentPath(tokenPath);
  }

  if (policy === 'tenantOverridable') {
    return slotAllowed;
  }

  return false;
}
