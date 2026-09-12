/** Branded component identifier (kebab-case). */
export type ComponentId = string & { readonly __brand: 'ComponentId' };

const COMPONENT_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const PLUGIN_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;

export function isValidComponentId(id: string): id is ComponentId {
  return COMPONENT_ID_PATTERN.test(id);
}

export function assertComponentId(id: string): ComponentId {
  if (!isValidComponentId(id)) {
    throw new Error(`Invalid component id "${id}": must be kebab-case starting with a letter.`);
  }
  return id as ComponentId;
}

export function isValidPluginId(id: string): boolean {
  return PLUGIN_ID_PATTERN.test(id);
}

let idCounter = 0;

/** Creates a stable unique id within a runtime instance scope. */
export function createId(prefix = 'cui'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/** @internal Reset id counter for tests. */
export function _resetIdCounter(): void {
  idCounter = 0;
}
