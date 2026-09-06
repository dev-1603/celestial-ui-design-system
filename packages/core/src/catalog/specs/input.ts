import { defineComponentSpec } from '../../spec/spec';
import { referenceContractBase } from './_shared';

export const inputSpec = defineComponentSpec({
  contract: {
    ...referenceContractBase('input'),
    props: {
      props: {
        value: { name: 'value', type: 'string', controlled: true },
        defaultValue: { name: 'defaultValue', type: 'string' },
        disabled: { name: 'disabled', type: 'boolean' },
        readOnly: { name: 'readOnly', type: 'boolean' },
        required: { name: 'required', type: 'boolean' },
        placeholder: { name: 'placeholder', type: 'string' },
        type: {
          name: 'type',
          type: 'enum',
          enumValues: ['text', 'email', 'password', 'search', 'tel', 'url'],
          default: 'text',
        },
      },
      nativePassthrough: 'control',
    },
    sizes: {
      sizes: ['sm', 'md', 'lg'],
      defaultSize: 'md',
    },
    states: {
      allowed: ['disabled', 'readonly', 'required', 'invalid', 'focus', 'focus-visible'],
    },
    parts: {
      parts: {
        root: { name: 'root', required: true },
        control: { name: 'control', required: true, refTarget: true, receivesNativeProps: true },
      },
    },
    events: {
      events: {
        change: { name: 'change' },
        focus: { name: 'focus' },
        blur: { name: 'blur' },
      },
    },
    controlled: {
      fields: [{ prop: 'value', event: 'change' }],
    },
    accessibility: {
      role: 'textbox',
      name: { from: 'slot:label' },
    },
    pointer: {
      interactions: [
        { action: 'click', suppressWhenDisabled: true },
        { action: 'hover' },
      ],
      suppressWhenDisabled: true,
    },
    focus: {
      initialFocus: 'autofocus',
    },
    formField: {
      fields: ['name', 'value', 'defaultValue', 'required', 'disabled', 'readOnly', 'invalid'],
    },
    behavior: {
      supportsDisabled: true,
    },
    refs: {
      primary: 'control',
      targets: { control: { part: 'control' } },
    },
  },
  metadata: {
    displayName: 'Input',
    purpose: 'Captures single-line text input.',
    status: 'stable',
    taxonomy: 'atomic',
    engineeringFamily: 'forms',
    complexity: 'moderate',
    capabilities: [
      'identity',
      'props',
      'sizes',
      'states',
      'parts',
      'events',
      'controlled-state',
      'accessibility',
      'pointer',
      'focus',
      'form-field',
      'behavior',
      'refs',
    ],
  },
  defaults: {
    props: { type: 'text', disabled: false, readOnly: false, required: false },
    size: 'md',
  },
  environment: { ssr: true, browser: true },
});
