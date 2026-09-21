import { defineComponentSpec } from '../../spec/spec';
import { finalizeReferenceContract, referenceContractBase } from './_shared';

export const selectSpec = defineComponentSpec({
  contract: finalizeReferenceContract({
    ...referenceContractBase('select'),
    props: {
      props: {
        value: { name: 'value', type: 'string', controlled: true },
        defaultValue: { name: 'defaultValue', type: 'string' },
        disabled: { name: 'disabled', type: 'boolean' },
        open: { name: 'open', type: 'boolean', controlled: true },
        defaultOpen: { name: 'defaultOpen', type: 'boolean' },
      },
      nativePassthrough: 'none',
    },
    sizes: {
      sizes: ['sm', 'md', 'lg'],
      defaultSize: 'md',
    },
    states: {
      allowed: ['open', 'closed', 'disabled', 'focus-visible', 'invalid'],
    },
    parts: {
      parts: {
        root: { name: 'root', required: true, refTarget: true },
        trigger: { name: 'trigger', required: true },
        value: { name: 'value', required: true },
        icon: { name: 'icon', required: false },
        content: { name: 'content', required: true },
        viewport: { name: 'viewport', required: true },
        group: { name: 'group', required: false },
        label: { name: 'label', required: false },
        item: { name: 'item', required: true },
        itemText: { name: 'itemText', required: true },
        itemIndicator: { name: 'itemIndicator', required: false },
        separator: { name: 'separator', required: false },
      },
    },
    events: {
      events: {
        change: { name: 'change' },
        openChange: { name: 'openChange' },
        select: { name: 'select' },
      },
    },
    controlled: {
      fields: [
        { prop: 'value', event: 'change' },
        { prop: 'open', event: 'openChange' },
      ],
    },
    accessibility: {
      role: 'combobox',
      name: { from: 'slot:label' },
    },
    keyboard: {
      bindings: [
        { keys: ['ArrowDown'], intent: 'next' },
        { keys: ['ArrowUp'], intent: 'prev' },
        { keys: ['Enter'], intent: 'open' },
        { keys: ['Escape'], intent: 'close' },
      ],
      roving: true,
      typeahead: true,
    },
    pointer: {
      interactions: [
        { action: 'click', suppressWhenDisabled: true },
        { action: 'press', suppressWhenDisabled: true },
      ],
      suppressWhenDisabled: true,
    },
    focus: {
      trap: false,
      restoreOnClose: true,
      roving: true,
    },
    collection: {
      ordered: true,
      typeahead: true,
      rovingFocus: true,
      keyboardNavigation: true,
    },
    selection: {
      mode: 'single',
      deselectable: false,
      selectOnFocus: false,
      disabledItemsIgnored: true,
    },
    overlay: {
      modal: false,
      dismissOnEscape: true,
      dismissOnOutside: true,
      restoreFocus: true,
    },
    formField: {
      fields: ['name', 'value', 'defaultValue', 'required', 'disabled', 'invalid'],
    },
    behavior: {
      supportsDisabled: true,
      openClosed: true,
      selectionMode: 'single',
      requiresRole: true,
    },
    localization: {
      keys: ['emptyMessage', 'noResultsMessage'],
      required: ['emptyMessage'],
    },
  }),
  metadata: {
    displayName: 'Select',
    purpose: 'Choose one value from a collection of options.',
    status: 'stable',
    taxonomy: 'molecular',
    engineeringFamily: 'collections',
    complexity: 'complex',
    capabilities: [
      'identity',
      'props',
      'sizes',
      'states',
      'parts',
      'events',
      'controlled-state',
      'accessibility',
      'keyboard',
      'pointer',
      'focus',
      'collection',
      'selection',
      'overlay',
      'behavior',
      'form-field',
      'composition',
      'localization',
    ],
  },
  defaults: {
    props: { disabled: false, defaultOpen: false },
    size: 'md',
  },
  environment: { ssr: true, browser: true },
});
