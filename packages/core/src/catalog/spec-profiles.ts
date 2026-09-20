import type { ComponentCapability } from '../capabilities/types';
import type { ComponentContract } from '../contracts/types';
import { CONTRACT_SCHEMA_VERSION } from '../version';
import { REFERENCE_SPEC_VERSION } from './specs/_shared';

type ProfileContractSections = Omit<ComponentContract, 'id'>;

function profileContractBase(): Pick<ComponentContract, 'version' | 'schemaVersion'> {
  return {
    version: REFERENCE_SPEC_VERSION,
    schemaVersion: CONTRACT_SCHEMA_VERSION,
  };
}

export type SpecProfileKey =
  | 'reference'
  | 'minimal'
  | 'primitive-action'
  | 'primitive-display'
  | 'form-text'
  | 'form-binary'
  | 'form-selection'
  | 'form-group'
  | 'overlay-modal'
  | 'overlay-floating'
  | 'overlay-menu'
  | 'collection-disclosure'
  | 'collection-tabs'
  | 'collection-command'
  | 'collection-tree'
  | 'data-table'
  | 'layout'
  | 'feedback'
  | 'media'
  | 'editor-shell'
  | 'template'
  | 'navigation';

export interface ProfileDefinition {
  readonly capabilities: readonly ComponentCapability[];
  readonly buildContract: (id: string) => ProfileContractSections;
}

const rootPart = {
  root: { name: 'root', required: true, refTarget: true, receivesNativeProps: true },
} as const;

const triggerContentParts = {
  root: { name: 'root', required: true },
  trigger: { name: 'trigger', required: true, refTarget: true },
  content: { name: 'content', required: true },
} as const;

const overlayParts = {
  root: { name: 'root', required: true },
  trigger: { name: 'trigger', required: false },
  overlay: { name: 'overlay', required: true },
  content: { name: 'content', required: true, refTarget: true },
  title: { name: 'title', required: false },
  description: { name: 'description', required: false },
  close: { name: 'close', required: false },
  footer: { name: 'footer', required: false },
} as const;

const activateKeyboard = [
  { keys: ['Enter'], intent: 'activate' as const },
  { keys: [' '], intent: 'activate' as const },
];

const dismissKeyboard = [{ keys: ['Escape'], intent: 'close' as const }];

const pointerClick = {
  interactions: [{ action: 'click' as const, suppressWhenDisabled: true }],
  suppressWhenDisabled: true,
} as const;

export const SPEC_PROFILES: Readonly<Record<SpecProfileKey, ProfileDefinition>> = {
  reference: {
    capabilities: ['identity'],
    buildContract: () => profileContractBase(),
  },
  minimal: {
    capabilities: ['identity', 'parts', 'accessibility'],
    buildContract: () => ({
      ...profileContractBase(),
      parts: { parts: { root: { name: 'root', required: true } } },
      accessibility: { role: 'separator' },
    }),
  },
  'primitive-action': {
    capabilities: [
      'identity',
      'props',
      'sizes',
      'states',
      'parts',
      'events',
      'accessibility',
      'keyboard',
      'pointer',
      'focus',
      'behavior',
      'polymorphism',
      'refs',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          disabled: { name: 'disabled', type: 'boolean' },
        },
        nativePassthrough: 'root',
      },
      sizes: { sizes: ['sm', 'md', 'lg'], defaultSize: 'md' },
      states: { allowed: ['disabled', 'focus-visible', 'hover', 'pressed'] },
      parts: { parts: rootPart },
      events: { events: { change: { name: 'change' } } },
      accessibility: { role: 'button', name: { from: 'contents' } },
      keyboard: { bindings: activateKeyboard },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      behavior: { supportsDisabled: true, requiresRole: true },
      polymorphism: { nativeTag: 'button', allowedAs: ['button', 'a'] },
      refs: { primary: 'root', targets: { root: { part: 'root' } } },
    }),
  },
  'primitive-display': {
    capabilities: ['identity', 'props', 'parts', 'accessibility', 'refs'],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          ariaLabel: { name: 'ariaLabel', type: 'string' },
        },
        nativePassthrough: 'root',
      },
      parts: { parts: { root: { name: 'root', required: true, refTarget: true } } },
      accessibility: { role: 'img', name: { from: 'prop:ariaLabel' } },
      refs: { primary: 'root', targets: { root: { part: 'root' } } },
    }),
  },
  'form-text': {
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
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          value: { name: 'value', type: 'string', controlled: true },
          defaultValue: { name: 'defaultValue', type: 'string' },
          disabled: { name: 'disabled', type: 'boolean' },
          readOnly: { name: 'readOnly', type: 'boolean' },
          required: { name: 'required', type: 'boolean' },
        },
        nativePassthrough: 'control',
      },
      sizes: { sizes: ['sm', 'md', 'lg'], defaultSize: 'md' },
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
        events: { change: { name: 'change' }, focus: { name: 'focus' }, blur: { name: 'blur' } },
      },
      controlled: { fields: [{ prop: 'value', event: 'change' }] },
      accessibility: { role: 'textbox', name: { from: 'slot:label' } },
      pointer: pointerClick,
      focus: { initialFocus: 'autofocus' },
      formField: {
        fields: ['name', 'value', 'defaultValue', 'required', 'disabled', 'readOnly', 'invalid'],
      },
      behavior: { supportsDisabled: true },
      refs: { primary: 'control', targets: { control: { part: 'control' } } },
    }),
  },
  'form-binary': {
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
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          checked: { name: 'checked', type: 'boolean', controlled: true },
          defaultChecked: { name: 'defaultChecked', type: 'boolean' },
          disabled: { name: 'disabled', type: 'boolean' },
        },
        nativePassthrough: 'control',
      },
      states: { allowed: ['disabled', 'checked', 'focus-visible'] },
      parts: {
        parts: {
          root: { name: 'root', required: true },
          control: { name: 'control', required: true, refTarget: true, receivesNativeProps: true },
        },
      },
      events: { events: { change: { name: 'change' } } },
      controlled: { fields: [{ prop: 'checked', event: 'change' }] },
      accessibility: { role: 'checkbox', name: { from: 'slot:label' } },
      keyboard: { bindings: activateKeyboard },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      formField: { fields: ['name', 'disabled', 'invalid'] },
      behavior: { supportsDisabled: true, requiresRole: true },
      refs: { primary: 'control', targets: { control: { part: 'control' } } },
    }),
  },
  'form-selection': {
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
      'localization',
    ],
    buildContract: () => ({
      ...profileContractBase(),
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
      sizes: { sizes: ['sm', 'md', 'lg'], defaultSize: 'md' },
      states: { allowed: ['open', 'closed', 'disabled', 'focus-visible', 'invalid'] },
      parts: {
        parts: {
          root: { name: 'root', required: true },
          trigger: { name: 'trigger', required: true, refTarget: true },
          content: { name: 'content', required: true },
          item: { name: 'item', required: false },
        },
      },
      events: { events: { change: { name: 'change' }, openChange: { name: 'openChange' } } },
      controlled: {
        fields: [
          { prop: 'value', event: 'change' },
          { prop: 'open', event: 'openChange' },
        ],
      },
      accessibility: { role: 'combobox', name: { from: 'slot:label' } },
      keyboard: { bindings: [...activateKeyboard, ...dismissKeyboard] },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      collection: { ordered: true, typeahead: true, rovingFocus: true, keyboardNavigation: true },
      selection: { mode: 'single', deselectable: false, disabledItemsIgnored: true },
      overlay: { modal: false, dismissOnEscape: true },
      behavior: { supportsDisabled: true, openClosed: true, requiresRole: true },
      formField: {
        fields: ['name', 'value', 'defaultValue', 'required', 'disabled', 'invalid'],
      },
      localization: { keys: ['placeholder', 'emptyMessage'] },
    }),
  },
  'form-group': {
    capabilities: [
      'identity',
      'props',
      'parts',
      'events',
      'accessibility',
      'behavior',
      'composition',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: { disabled: { name: 'disabled', type: 'boolean' } },
        nativePassthrough: 'none',
      },
      parts: { parts: { root: { name: 'root', required: true } } },
      events: { events: { change: { name: 'change' }, submit: { name: 'submit' } } },
      accessibility: { role: 'form', name: { from: 'prop:ariaLabel' } },
      behavior: { supportsDisabled: true, requiresRole: true },
    }),
  },
  'overlay-modal': {
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
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          open: { name: 'open', type: 'boolean', controlled: true },
          defaultOpen: { name: 'defaultOpen', type: 'boolean' },
          modal: { name: 'modal', type: 'boolean', default: true },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['open', 'closed', 'focus-visible'] },
      parts: { parts: overlayParts },
      events: { events: { openChange: { name: 'openChange' }, dismiss: { name: 'dismiss' } } },
      controlled: { fields: [{ prop: 'open', event: 'openChange' }] },
      accessibility: {
        role: 'dialog',
        name: { from: 'prop:ariaLabel' },
        },
      keyboard: { bindings: dismissKeyboard },
      pointer: { interactions: [{ action: 'click' }], suppressWhenDisabled: false },
      focus: { trap: true, restoreOnClose: true },
      overlay: { modal: true, dismissOnEscape: true, dismissOnOutside: true, restoreFocus: true },
      behavior: { openClosed: true },
      refs: { primary: 'content', targets: { content: { part: 'content' } } },
      localization: { keys: ['title', 'description', 'closeLabel'] },
      conformance: {
        requirements: [
          { area: 'accessibility', required: true },
          { area: 'keyboard', required: true },
          { area: 'focus', required: true },
          { area: 'overlay', required: true },
        ],
      },
    }),
  },
  'overlay-floating': {
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
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          open: { name: 'open', type: 'boolean', controlled: true },
          defaultOpen: { name: 'defaultOpen', type: 'boolean' },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['open', 'closed'] },
      parts: { parts: triggerContentParts },
      events: { events: { openChange: { name: 'openChange' } } },
      controlled: { fields: [{ prop: 'open', event: 'openChange' }] },
      accessibility: { role: 'tooltip', name: { from: 'contents' } },
      keyboard: { bindings: dismissKeyboard },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      overlay: { modal: false, dismissOnEscape: true },
      behavior: { openClosed: true },
    }),
  },
  'overlay-menu': {
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
      'collection',
      'selection',
      'overlay',
      'behavior',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          open: { name: 'open', type: 'boolean', controlled: true },
          defaultOpen: { name: 'defaultOpen', type: 'boolean' },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['open', 'closed', 'focus-visible'] },
      parts: {
        parts: {
          ...triggerContentParts,
          item: { name: 'item', required: false },
          separator: { name: 'separator', required: false },
        },
      },
      events: { events: { openChange: { name: 'openChange' }, select: { name: 'select' } } },
      controlled: { fields: [{ prop: 'open', event: 'openChange' }] },
      accessibility: { role: 'menu', name: { from: 'prop:ariaLabel' } },
      keyboard: { bindings: [...activateKeyboard, ...dismissKeyboard] },
      pointer: pointerClick,
      focus: { trap: false, restoreFocus: true },
      collection: { ordered: true, rovingFocus: true, keyboardNavigation: true },
      selection: { mode: 'none', disabledItemsIgnored: true },
      overlay: { modal: false, dismissOnEscape: true, dismissOnOutside: true },
      behavior: { openClosed: true },
    }),
  },
  'collection-disclosure': {
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
      'behavior',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          open: { name: 'open', type: 'boolean', controlled: true },
          defaultOpen: { name: 'defaultOpen', type: 'boolean' },
          disabled: { name: 'disabled', type: 'boolean' },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['open', 'closed', 'disabled', 'focus-visible'] },
      parts: {
        parts: {
          root: { name: 'root', required: true },
          trigger: { name: 'trigger', required: true, refTarget: true },
          content: { name: 'content', required: true },
        },
      },
      events: { events: { openChange: { name: 'openChange' } } },
      controlled: { fields: [{ prop: 'open', event: 'openChange' }] },
      accessibility: { role: 'region', name: { from: 'prop:ariaLabel' } },
      keyboard: { bindings: activateKeyboard },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      behavior: { supportsDisabled: true, openClosed: true },
    }),
  },
  'collection-tabs': {
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
      'collection',
      'selection',
      'behavior',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          value: { name: 'value', type: 'string', controlled: true },
          defaultValue: { name: 'defaultValue', type: 'string' },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['focus-visible', 'selected'] },
      parts: {
        parts: {
          root: { name: 'root', required: true },
          list: { name: 'list', required: true },
          trigger: { name: 'trigger', required: false },
          content: { name: 'content', required: false },
        },
      },
      events: { events: { change: { name: 'change' } } },
      controlled: { fields: [{ prop: 'value', event: 'change' }] },
      accessibility: { role: 'tablist', name: { from: 'prop:ariaLabel' } },
      keyboard: { bindings: activateKeyboard },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      collection: { ordered: true, rovingFocus: true, keyboardNavigation: true },
      selection: { mode: 'single', deselectable: false, disabledItemsIgnored: true },
      behavior: { supportsDisabled: false },
    }),
  },
  'collection-command': {
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
      'overlay',
      'behavior',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          open: { name: 'open', type: 'boolean', controlled: true },
          defaultOpen: { name: 'defaultOpen', type: 'boolean' },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['open', 'closed', 'focus-visible'] },
      parts: {
        parts: {
          root: { name: 'root', required: true },
          input: { name: 'input', required: true, refTarget: true },
          list: { name: 'list', required: true },
          item: { name: 'item', required: false },
        },
      },
      events: { events: { select: { name: 'select' }, openChange: { name: 'openChange' } } },
      accessibility: { role: 'listbox', name: { from: 'prop:ariaLabel' } },
      keyboard: { bindings: [...activateKeyboard, ...dismissKeyboard] },
      pointer: pointerClick,
      focus: { trap: true },
      collection: { ordered: true, typeahead: true, rovingFocus: true, keyboardNavigation: true },
      selection: { mode: 'single', deselectable: false, disabledItemsIgnored: true },
      overlay: { modal: true, dismissOnEscape: true },
      behavior: { openClosed: true },
    }),
  },
  'collection-tree': {
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
      'collection',
      'selection',
      'behavior',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          expandedKeys: { name: 'expandedKeys', type: 'string', controlled: true },
          selectedKeys: { name: 'selectedKeys', type: 'string', controlled: true },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['expanded', 'collapsed', 'selected', 'focus-visible'] },
      parts: {
        parts: {
          root: { name: 'root', required: true },
          item: { name: 'item', required: false },
          group: { name: 'group', required: false },
        },
      },
      events: { events: { change: { name: 'change' }, select: { name: 'select' } } },
      controlled: {
        fields: [
          { prop: 'expandedKeys', event: 'change' },
          { prop: 'selectedKeys', event: 'select' },
        ],
      },
      accessibility: { role: 'tree', name: { from: 'prop:ariaLabel' } },
      keyboard: { bindings: activateKeyboard },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      collection: { hierarchical: true, rovingFocus: true, keyboardNavigation: true },
      selection: { mode: 'multiple', deselectable: true, disabledItemsIgnored: true },
      behavior: { supportsDisabled: true },
    }),
  },
  'data-table': {
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
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          sortColumn: { name: 'sortColumn', type: 'string' },
          selectedRows: { name: 'selectedRows', type: 'string', controlled: true },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['focus-visible', 'selected'] },
      parts: {
        parts: {
          root: { name: 'root', required: true, refTarget: true },
          header: { name: 'header', required: false },
          body: { name: 'body', required: true },
          row: { name: 'row', required: false },
          cell: { name: 'cell', required: false },
        },
      },
      events: { events: { change: { name: 'change' }, select: { name: 'select' } } },
      accessibility: { role: 'grid', name: { from: 'prop:ariaLabel' } },
      keyboard: { bindings: activateKeyboard },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      collection: { ordered: true, rovingFocus: true, keyboardNavigation: true },
      selection: { mode: 'multiple', deselectable: true, disabledItemsIgnored: true },
      behavior: { supportsDisabled: false },
      refs: { primary: 'root', targets: { root: { part: 'root' } } },
    }),
  },
  layout: {
    capabilities: ['identity', 'parts', 'accessibility', 'composition', 'refs'],
    buildContract: () => ({
      ...profileContractBase(),
      parts: { parts: { root: { name: 'root', required: true, refTarget: true } } },
      accessibility: { role: 'region', name: { from: 'prop:ariaLabel' } },
      composition: { allowedChildren: undefined },
      refs: { primary: 'root', targets: { root: { part: 'root' } } },
    }),
  },
  feedback: {
    capabilities: ['identity', 'props', 'states', 'parts', 'events', 'accessibility', 'behavior'],
    buildContract: () => ({
      ...profileContractBase(),
      props: { props: { open: { name: 'open', type: 'boolean' } }, nativePassthrough: 'none' },
      states: { allowed: ['open', 'closed', 'error', 'warning', 'success', 'loading'] },
      parts: { parts: { root: { name: 'root', required: true, refTarget: true } } },
      events: { events: { dismiss: { name: 'dismiss' } } },
      accessibility: { role: 'status', name: { from: 'contents' } },
      behavior: { supportsLoading: true },
    }),
  },
  media: {
    capabilities: ['identity', 'props', 'parts', 'accessibility', 'refs'],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: { src: { name: 'src', type: 'string' }, alt: { name: 'alt', type: 'string' } },
        nativePassthrough: 'root',
      },
      parts: {
        parts: {
          root: { name: 'root', required: true, refTarget: true, receivesNativeProps: true },
        },
      },
      accessibility: { role: 'img', name: { from: 'prop:ariaLabel' } },
      refs: { primary: 'root', targets: { root: { part: 'root' } } },
    }),
  },
  'editor-shell': {
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
      'behavior',
      'environment',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: {
          value: { name: 'value', type: 'string', controlled: true },
          defaultValue: { name: 'defaultValue', type: 'string' },
          readOnly: { name: 'readOnly', type: 'boolean' },
        },
        nativePassthrough: 'none',
      },
      states: { allowed: ['focus-visible', 'readonly', 'invalid'] },
      parts: {
        parts: {
          root: { name: 'root', required: true },
          viewport: { name: 'viewport', required: true, refTarget: true },
        },
      },
      events: { events: { change: { name: 'change' } } },
      controlled: { fields: [{ prop: 'value', event: 'change' }] },
      accessibility: { role: 'application', name: { from: 'prop:ariaLabel' } },
      keyboard: { bindings: activateKeyboard },
      pointer: pointerClick,
      focus: { trap: false },
      behavior: { supportsDisabled: false },
      environment: { requirements: { browser: true, ssr: true } },
    }),
  },
  template: {
    capabilities: ['identity', 'parts', 'accessibility', 'composition', 'refs', 'directionality'],
    buildContract: () => ({
      ...profileContractBase(),
      parts: {
        parts: {
          root: { name: 'root', required: true, refTarget: true },
          header: { name: 'header', required: false },
          content: { name: 'content', required: false },
          footer: { name: 'footer', required: false },
        },
      },
      accessibility: { role: 'region', name: { from: 'prop:ariaLabel' } },
      composition: { allowedChildren: undefined },
      refs: { primary: 'root', targets: { root: { part: 'root' } } },
    }),
  },
  navigation: {
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
      'behavior',
      'directionality',
    ],
    buildContract: () => ({
      ...profileContractBase(),
      props: {
        props: { value: { name: 'value', type: 'string', controlled: true } },
        nativePassthrough: 'none',
      },
      states: { allowed: ['focus-visible', 'selected', 'disabled'] },
      parts: {
        parts: {
          root: { name: 'root', required: true },
          item: { name: 'item', required: false },
          link: { name: 'link', required: false, refTarget: true },
        },
      },
      events: { events: { change: { name: 'change' } } },
      accessibility: { role: 'navigation', name: { from: 'prop:ariaLabel' } },
      keyboard: { bindings: activateKeyboard },
      pointer: pointerClick,
      focus: { visibleOnly: true },
      collection: { ordered: true, rovingFocus: true, keyboardNavigation: true },
      behavior: { supportsDisabled: true },
    }),
  },
};
