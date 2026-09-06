/** Reserved by @celestial-ui/styles — do not use for component parts. */
export const STYLES_RESERVED_ATTRIBUTES = [
  'data-cui-theme',
  'data-cui-mode',
  'data-cui-mode-preference',
  'data-cui-root',
  'data-cui-sandbox',
  'data-cui-hash',
] as const;

export const CUI_ATTRIBUTES = {
  component: 'data-cui-component',
  part: 'data-cui-part',
  state: 'data-cui-state',
  variant: 'data-cui-variant',
  size: 'data-cui-size',
} as const;

const CAMEL_TO_KEBAB = /[A-Z]/g;

export function toKebabCase(value: string): string {
  return value.replace(CAMEL_TO_KEBAB, (match) => `-${match.toLowerCase()}`);
}

export function toCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

export interface PartAttributeOptions {
  componentId: string;
  partName: string;
  states?: readonly string[];
  variant?: string;
  size?: string;
}

export function buildPartAttributes(options: PartAttributeOptions): Record<string, string> {
  const attrs: Record<string, string> = {
    [CUI_ATTRIBUTES.component]: options.componentId,
    [CUI_ATTRIBUTES.part]: toKebabCase(options.partName),
  };
  if (options.states && options.states.length > 0) {
    attrs[CUI_ATTRIBUTES.state] = [...options.states].sort().join(' ');
  }
  if (options.variant) {
    attrs[CUI_ATTRIBUTES.variant] = toKebabCase(options.variant);
  }
  if (options.size) {
    attrs[CUI_ATTRIBUTES.size] = toKebabCase(options.size);
  }
  return attrs;
}
