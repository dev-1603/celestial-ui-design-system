import { defineComponentSpec } from '../../spec/spec';
import { finalizeReferenceContract, referenceContractBase } from './_shared';

export const radioGroupSpec = defineComponentSpec({
  contract: finalizeReferenceContract({
    ...referenceContractBase('radio-group'),
    props: {
      props: {
        value: { name: 'value', type: 'string', controlled: true },
        defaultValue: { name: 'defaultValue', type: 'string' },
        disabled: { name: 'disabled', type: 'boolean' },
        required: { name: 'required', type: 'boolean' },
      },
      nativePassthrough: 'none',
    },
    states: {
      allowed: ['disabled', 'invalid', 'focus-visible'],
    },
    parts: {
      parts: {
        root: { name: 'root', required: true, refTarget: true },
        item: { name: 'item', required: true },
        indicator: { name: 'indicator', required: false },
        label: { name: 'label', required: false },
      },
    },
    events: {
      events: {
        change: { name: 'change' },
      },
    },
    controlled: {
      fields: [{ prop: 'value', event: 'change' }],
    },
    accessibility: {
      role: 'radiogroup',
      name: { from: 'slot:label' },
    },
    keyboard: {
      bindings: [
        { keys: ['ArrowDown'], intent: 'next' },
        { keys: ['ArrowRight'], intent: 'next' },
        { keys: ['ArrowUp'], intent: 'prev' },
        { keys: ['ArrowLeft'], intent: 'prev' },
        { keys: ['Home'], intent: 'first' },
        { keys: ['End'], intent: 'last' },
        { keys: [' '], intent: 'activate' },
      ],
      roving: true,
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
      roving: true,
    },
    collection: {
      ordered: true,
      typeahead: false,
      rovingFocus: true,
      keyboardNavigation: true,
    },
    selection: {
      mode: 'single',
      deselectable: false,
      selectOnFocus: true,
      disabledItemsIgnored: true,
    },
    formField: {
      fields: ['name', 'value', 'defaultValue', 'required', 'disabled', 'invalid'],
    },
    behavior: {
      supportsDisabled: true,
      selectionMode: 'single',
      requiresRole: true,
    },
    polymorphism: {
      nativeTag: 'div',
    },
    refs: {
      primary: 'root',
      targets: { root: { part: 'root' } },
    },
  }),
  metadata: {
    displayName: 'Radio Group',
    purpose: 'Single selection among mutually exclusive options.',
    status: 'stable',
    taxonomy: 'molecular',
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
      'collection',
      'selection',
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
