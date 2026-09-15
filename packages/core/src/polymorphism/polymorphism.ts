import type { PolymorphismContract } from './types';

const TAG_PROPS: Record<string, readonly string[]> = {
  a: ['href', 'target', 'rel', 'download'],
  button: ['type', 'form', 'formAction', 'formMethod', 'formNoValidate', 'formTarget'],
  input: ['type', 'name', 'value', 'placeholder', 'autoComplete'],
};

export function resolvePolymorphicTag(contract: PolymorphismContract, as?: string): string {
  if (!as) return contract.nativeTag;
  const allowed = contract.allowedAs ?? [contract.nativeTag];
  if (!allowed.includes(as)) {
    return contract.nativeTag;
  }
  return contract.presets?.[as]?.nativeTag ?? as;
}

export function filterPropsForTag(
  tag: string,
  props: Record<string, unknown>,
): Record<string, unknown> {
  const allowed = TAG_PROPS[tag];
  const reserved = new Set(['as', 'children', 'className', 'style', 'ref', 'slot', 'part']);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (reserved.has(key)) continue;
    if (key.startsWith('data-') || key.startsWith('aria-')) {
      result[key] = value;
      continue;
    }
    if (!allowed) {
      result[key] = value;
      continue;
    }
    if (allowed.includes(key)) {
      result[key] = value;
    }
  }
  return result;
}
