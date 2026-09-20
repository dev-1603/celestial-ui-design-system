import { defineComponentSpec } from '../../spec/spec';
import { finalizeReferenceContract, referenceContractBase } from './_shared';

export const switchSpec = defineComponentSpec({
  contract: finalizeReferenceContract({
    ...referenceContractBase('switch'),
    props: {
      props: {
        checked: { name: 'checked', type: 'boolean', controlled: true },
        defaultChecked: { name: 'defaultChecked', type: 'boolean' },
        disabled: { name: 'disabled', type: 'boolean' },
        required: { name: 'required', type: 'boolean' },
      },
      nativePassthrough: 'control',
    },
    states: {
      allowed: ['checked', 'disabled', 'invalid', 'focus-visible', 'pressed'],
    },
    parts: {
      parts: {
        root: { name: 'root', required: true, refTarget: true },
        control: { name: 'control', required: true, receivesNativeProps: true },
        thumb: { name: 'thumb', required: true },
        label: { name: 'label', required: false },
      },
    },
    events: {
      events: {
        change: { name: 'change' },
      },
    },
    controlled: {
      fields: [{ prop: 'checked', event: 'change' }],
    },
    accessibility: {
      role: 'switch',
      name: { from: 'slot:label' },
    },
    keyboard: {
      bindings: [{ keys: [' '], intent: 'activate' }],
    },
    pointer: {
      interactions: [
        { action: 'click', suppressWhenDisabled: true },
        { action: 'press', suppressWhenDisabled: true },
      ],
      suppressWhenDisabled: true,
    },
    focus: {
      visibleOnly: true,
    },
    formField: {
      fields: ['name', 'value', 'required', 'disabled', 'invalid'],
    },
    behavior: {
      supportsDisabled: true,
      requiresRole: true,
    },
    polymorphism: {
      nativeTag: 'button',
    },
    refs: {
      primary: 'root',
      targets: { root: { part: 'root' } },
    },
  }),
  metadata: {
    displayName: 'Switch',
    purpose: 'Binary on/off toggle control.',
    status: 'stable',
    taxonomy: 'atomic',
    engineeringFamily: 'forms',
    complexity: 'simple',
    capabilities: [
      'identity',
      'props',
      'states',
      'parts',
      'events',
      'controlled-state',
      'accessibility',
      'keyboard',
      'pointer',
      'focus',
      'form-field',
      'behavior',
      'polymorphism',
      'refs',
    ],
  },
  defaults: {
    props: { disabled: false, required: false },
  },
  environment: { ssr: true, browser: true },
});
