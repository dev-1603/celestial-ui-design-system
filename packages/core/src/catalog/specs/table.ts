import { defineComponentSpec } from '../../spec/spec';
import { referenceContractBase } from './_shared';

export const tableSpec = defineComponentSpec({
  contract: {
    ...referenceContractBase('table'),
    props: {
      props: {
        selectionMode: {
          name: 'selectionMode',
          type: 'enum',
          enumValues: ['none', 'single', 'multiple'],
          default: 'none',
        },
        disabled: { name: 'disabled', type: 'boolean' },
      },
      nativePassthrough: 'none',
    },
    states: {
      allowed: ['selected', 'disabled', 'focus-visible', 'loading'],
    },
    parts: {
      parts: {
        root: { name: 'root', required: true, refTarget: true },
        header: { name: 'header', required: false },
        body: { name: 'body', required: true },
        row: { name: 'row', required: true },
        cell: { name: 'cell', required: true },
        columnHeader: { name: 'columnHeader', required: false },
      },
    },
    events: {
      events: {
        select: { name: 'select' },
        change: { name: 'change' },
      },
    },
    accessibility: {
      role: 'grid',
      keyboard: [
        { keys: ['ArrowDown', 'ArrowUp'], intent: 'next' },
        { keys: ['ArrowLeft', 'ArrowRight'], intent: 'prev' },
      ],
    },
    keyboard: {
      bindings: [
        { keys: ['ArrowDown'], intent: 'next' },
        { keys: ['ArrowUp'], intent: 'prev' },
        { keys: ['ArrowLeft'], intent: 'prev' },
        { keys: ['ArrowRight'], intent: 'next' },
      ],
      roving: true,
    },
    pointer: {
      interactions: [{ action: 'click' }, { action: 'hover' }],
    },
    focus: {
      roving: true,
      visibleOnly: true,
    },
    collection: {
      ordered: true,
      virtualized: true,
      keyboardNavigation: true,
      rovingFocus: true,
    },
    selection: {
      mode: 'multiple',
      deselectable: true,
      selectOnFocus: false,
      disabledItemsIgnored: true,
    },
    behavior: {
      selectionMode: 'multiple',
      requiresRole: true,
    },
    refs: {
      primary: 'root',
      targets: { root: { part: 'root' } },
    },
  },
  metadata: {
    displayName: 'Table',
    purpose: 'Tabular data display with optional selection and keyboard traversal.',
    status: 'stable',
    taxonomy: 'organism',
    engineeringFamily: 'data-display',
    complexity: 'complex',
    capabilities: [
      'identity',
      'props',
      'states',
      'parts',
      'events',
      'accessibility',
      'keyboard',
      'pointer',
      'focus',
      'collection',
      'selection',
      'behavior',
      'refs',
    ],
  },
  defaults: {
    props: { selectionMode: 'none', disabled: false },
  },
  environment: { ssr: true, browser: true, node: true },
});
