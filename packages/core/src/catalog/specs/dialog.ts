import { defineComponentSpec } from '../../spec/spec';
import { referenceContractBase } from './_shared';

export const dialogSpec = defineComponentSpec({
  contract: {
    ...referenceContractBase('dialog'),
    props: {
      props: {
        open: { name: 'open', type: 'boolean', controlled: true },
        defaultOpen: { name: 'defaultOpen', type: 'boolean' },
        modal: { name: 'modal', type: 'boolean', default: true },
      },
      nativePassthrough: 'none',
    },
    states: {
      allowed: ['open', 'closed', 'focus-visible'],
    },
    parts: {
      parts: {
        root: { name: 'root', required: true },
        trigger: { name: 'trigger', required: false },
        overlay: { name: 'overlay', required: true },
        content: { name: 'content', required: true, refTarget: true },
        title: { name: 'title', required: true },
        description: { name: 'description', required: false },
        close: { name: 'close', required: false },
        footer: { name: 'footer', required: false },
      },
    },
    events: {
      events: {
        openChange: { name: 'openChange' },
        dismiss: { name: 'dismiss' },
      },
    },
    controlled: {
      fields: [{ prop: 'open', event: 'openChange' }],
    },
    accessibility: {
      role: 'dialog',
      name: { from: 'slot:label' },
      focus: { trap: true, restoreOnClose: true, initialFocus: 'content' },
      keyboard: [{ keys: ['Escape'], intent: 'dismiss' }],
    },
    keyboard: {
      bindings: [{ keys: ['Escape'], intent: 'dismiss' }],
    },
    pointer: {
      interactions: [
        { action: 'click' },
        { action: 'press', suppressWhenDisabled: true },
      ],
    },
    focus: {
      trap: true,
      restoreOnClose: true,
      initialFocus: 'content',
    },
    overlay: {
      modal: true,
      dismissOnEscape: true,
      dismissOnOutside: true,
      scrollLock: true,
      restoreFocus: true,
    },
    behavior: {
      openClosed: true,
      requiresRole: true,
    },
    refs: {
      primary: 'content',
      targets: { content: { part: 'content' } },
    },
    localization: {
      keys: ['closeLabel', 'ariaLabel'],
      required: ['closeLabel'],
    },
    conformance: {
      requirements: [
        { area: 'overlay', required: true },
        { area: 'focus', required: true },
        { area: 'keyboard', required: true },
      ],
    },
  },
  metadata: {
    displayName: 'Dialog',
    purpose: 'Modal surface for focused tasks and confirmations.',
    status: 'stable',
    taxonomy: 'organism',
    engineeringFamily: 'overlays',
    complexity: 'complex',
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
      'overlay',
      'behavior',
      'refs',
      'localization',
      'conformance',
    ],
  },
  defaults: {
    props: { modal: true, defaultOpen: false },
  },
  environment: { ssr: true, browser: true },
});
