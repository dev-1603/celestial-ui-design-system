import { defineComponentSpec } from '../../spec/spec';
import { referenceContractBase } from './_shared';

export const buttonSpec = defineComponentSpec({
  contract: {
    ...referenceContractBase('button'),
    props: {
      props: {
        disabled: { name: 'disabled', type: 'boolean' },
        loading: { name: 'loading', type: 'boolean' },
        type: {
          name: 'type',
          type: 'enum',
          enumValues: ['button', 'submit', 'reset'],
          default: 'button',
        },
      },
      nativePassthrough: 'root',
    },
    variants: {
      variants: {
        variant: {
          name: 'variant',
          values: ['primary', 'secondary', 'ghost', 'destructive'],
          default: 'primary',
        },
      },
    },
    sizes: {
      sizes: ['sm', 'md', 'lg'],
      defaultSize: 'md',
    },
    states: {
      allowed: ['disabled', 'loading', 'pressed', 'focus-visible', 'hover'],
    },
    parts: {
      parts: {
        root: { name: 'root', required: true, refTarget: true, receivesNativeProps: true },
        icon: { name: 'icon', required: false },
        label: { name: 'label', required: false },
      },
    },
    events: {
      events: {
        change: { name: 'change' },
      },
    },
    accessibility: {
      role: 'button',
      name: { from: 'prop:ariaLabel' },
      keyboard: [{ keys: ['Enter', ' '], intent: 'activate' }],
    },
    keyboard: {
      bindings: [
        { keys: ['Enter'], intent: 'activate' },
        { keys: [' '], intent: 'activate' },
      ],
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
    behavior: {
      supportsDisabled: true,
      supportsLoading: true,
      requiresRole: true,
    },
    polymorphism: {
      nativeTag: 'button',
      allowedAs: ['button', 'a'],
    },
    refs: {
      primary: 'root',
      targets: { root: { part: 'root' } },
    },
    localization: {
      keys: ['ariaLabel', 'loadingMessage'],
    },
  },
  metadata: {
    displayName: 'Button',
    purpose: 'Triggers an action or submits a form.',
    description: 'Primary action control with variant and size dimensions.',
    status: 'stable',
    taxonomy: 'atomic',
    engineeringFamily: 'primitives',
    complexity: 'simple',
    capabilities: [
      'identity',
      'props',
      'variants',
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
      'localization',
    ],
  },
  defaults: {
    props: { type: 'button', disabled: false, loading: false },
    variants: { variant: 'primary' },
    size: 'md',
  },
  environment: { ssr: true, browser: true },
});
