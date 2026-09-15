export const COMPONENT_STATES = [
  'idle',
  'hover',
  'focus',
  'focus-visible',
  'pressed',
  'selected',
  'checked',
  'indeterminate',
  'expanded',
  'collapsed',
  'open',
  'closed',
  'disabled',
  'readonly',
  'required',
  'loading',
  'busy',
  'invalid',
  'valid',
  'error',
  'warning',
  'success',
] as const;

export type ComponentState = (typeof COMPONENT_STATES)[number];

export type CheckedPayload = 'true' | 'false' | 'mixed';

export interface StatePayloads {
  checked?: CheckedPayload;
  loading?: { labelKey?: string };
}

export interface StatesContract {
  readonly allowed: readonly ComponentState[];
}

export interface StateSetSnapshot {
  readonly states: ReadonlySet<ComponentState>;
  readonly payloads: Readonly<StatePayloads>;
}

const MUTUALLY_EXCLUSIVE: ReadonlyArray<readonly ComponentState[]> = [
  ['expanded', 'collapsed'],
  ['open', 'closed'],
  ['invalid', 'valid'],
  ['loading', 'busy'],
];

export function createStateSet(
  initial?: readonly ComponentState[],
  payloads?: StatePayloads,
): StateSetSnapshot {
  const states = new Set<ComponentState>(initial ?? []);
  return { states, payloads: payloads ?? {} };
}

export function addState(
  snapshot: StateSetSnapshot,
  state: ComponentState,
  payloads?: Partial<StatePayloads>,
): StateSetSnapshot {
  const states = new Set(snapshot.states);
  for (const group of MUTUALLY_EXCLUSIVE) {
    if (group.includes(state)) {
      for (const other of group) {
        if (other !== state) states.delete(other);
      }
    }
  }
  states.add(state);
  return {
    states,
    payloads: { ...snapshot.payloads, ...payloads },
  };
}

export function removeState(snapshot: StateSetSnapshot, state: ComponentState): StateSetSnapshot {
  const states = new Set(snapshot.states);
  states.delete(state);
  return { states, payloads: snapshot.payloads };
}

function compareUtf16(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function serializeStates(states: ReadonlySet<ComponentState>): string {
  const filtered = [...states].filter((s) => s !== 'idle').sort(compareUtf16);
  return filtered.join(' ');
}

export interface DomStateAttributes {
  'data-cui-state'?: string;
  'aria-disabled'?: 'true';
  'aria-readonly'?: 'true';
  'aria-busy'?: 'true';
  'aria-invalid'?: 'true' | 'false';
  'aria-expanded'?: 'true' | 'false';
  'aria-selected'?: 'true' | 'false';
  'aria-checked'?: CheckedPayload;
  disabled?: boolean;
}

export function statesToDomAttributes(snapshot: StateSetSnapshot): DomStateAttributes {
  const attrs: DomStateAttributes = {};
  const serialized = serializeStates(snapshot.states);
  if (serialized) {
    attrs['data-cui-state'] = serialized;
  }
  if (snapshot.states.has('disabled')) {
    attrs['aria-disabled'] = 'true';
  }
  if (snapshot.states.has('readonly')) {
    attrs['aria-readonly'] = 'true';
  }
  if (snapshot.states.has('loading')) {
    attrs['aria-busy'] = 'true';
  }
  if (snapshot.states.has('invalid')) {
    attrs['aria-invalid'] = 'true';
  } else if (snapshot.states.has('valid')) {
    attrs['aria-invalid'] = 'false';
  }
  if (snapshot.states.has('expanded')) {
    attrs['aria-expanded'] = 'true';
  } else if (snapshot.states.has('collapsed')) {
    attrs['aria-expanded'] = 'false';
  }
  if (snapshot.states.has('selected')) {
    attrs['aria-selected'] = 'true';
  }
  if (snapshot.states.has('checked') && snapshot.payloads.checked) {
    attrs['aria-checked'] = snapshot.payloads.checked;
  }
  return attrs;
}
