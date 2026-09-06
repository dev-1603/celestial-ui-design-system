import { defineComponentSpec } from '../../spec/spec';
import { referenceContractBase } from './_shared';

export const checkboxSpec = defineComponentSpec({
  contract: {
    ...referenceContractBase('checkbox'),
    props: {
      props: {
        checked: { name: 'checked', type: 'boolean', controlled: true },
        defaultChecked: { name: 'defaultChecked', type: 'boolean' },
        disabled: { name: 'disabled', type: 'boolean' },
        indeterminate: { name: 'indeterminate', type: 'boolean' },
        required: { name: 'required', type: 'boolean' },
      },
      nativePassthrough: 'control',
    },
    states: {
      allowed: ['checked', 'indeterminate', 'disabled', 'invalid', 'focus-visible', 'pressed'],
    },
    parts: {
      parts: {
        root: { name: 'root', required: true, refTarget: true },
        control: { name: 'control', required: true, receivesNativeProps: true },
        indicator: { name: 'indicator', required: true },
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
      role: 'checkbox',
      name: { from: 'slot:label' },
      keyboard: [{ keys: [' '], intent: 'activate' }],
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
    },
    refs: {
      primary: 'root',
      targets: { root: { part: 'root' } },
    },
  },
  metadata: {
    displayName: 'Checkbox',
    purpose: 'Binary or indeterminate selection control.',
    status: 'stable',
    taxonomy: 'atomic',
    engineeringFamily: 'forms',
    complexity: 'moderate',
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
      'refs',
    ],
  },
  defaults: {
    props: { disabled: false, indeterminate: false, required: false },
  },
  environment: { ssr: true, browser: true },
});
