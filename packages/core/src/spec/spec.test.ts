import { describe, it, expect } from 'vitest';
import { CONTRACT_SCHEMA_VERSION, SPEC_SCHEMA_VERSION } from '../version';
import { defineComponentSpec } from '../spec/spec';
import { createDisclosure } from '../behavior/disclosure';
import { createControllableState } from '../behavior/controllable';
import { createCollection, createSelection } from '../collection';
import { statesToDomAttributes, createStateSet, addState } from '../state/state';
import { buildPartAttributes } from '../naming/dom-attributes';
import { createCelestialRuntime } from '../runtime/runtime';
import { createNullEnvironment } from '../environment/environment';

describe('defineComponentSpec', () => {
  it('validates and freezes a minimal button spec', () => {
    const spec = defineComponentSpec({
      contract: {
        id: 'button',
        version: '1.0.0',
        schemaVersion: CONTRACT_SCHEMA_VERSION,
        props: {
          props: {
            disabled: { name: 'disabled', type: 'boolean' },
          },
          nativePassthrough: 'root',
        },
        states: { allowed: ['disabled', 'loading', 'pressed'] },
        parts: {
          parts: {
            root: { name: 'root', required: true, refTarget: true },
          },
        },
        accessibility: { role: 'button' },
        polymorphism: { nativeTag: 'button', allowedAs: ['button', 'a'] },
        refs: { primary: 'root', targets: { root: { part: 'root' } } },
      },
      metadata: {
        displayName: 'Button',
        status: 'stable',
      },
    });

    expect(spec.contract.id).toBe('button');
    expect(Object.isFrozen(spec)).toBe(true);
    expect(() => {
      (spec as { metadata: { displayName: string } }).metadata.displayName = 'x';
    }).toThrow();
  });
});

describe('createDisclosure', () => {
  it('opens and closes in uncontrolled mode', () => {
    const d = createDisclosure({ defaultOpen: false });
    d.open();
    expect(d.getSnapshot().open).toBe(true);
    d.close();
    expect(d.getSnapshot().open).toBe(false);
    d.destroy();
  });
});

describe('createControllableState', () => {
  it('tracks uncontrolled value', () => {
    const state = createControllableState({ defaultValue: 'a' });
    state.setValue('b');
    expect(state.getSnapshot().value).toBe('b');
    state.destroy();
  });
});

describe('collection + selection', () => {
  it('registers items and selects', () => {
    const collection = createCollection();
    const dispose = collection.register({ id: 'a', textValue: 'Alpha' });
    collection.register({ id: 'b', textValue: 'Beta' });
    const selection = createSelection({ mode: 'single', defaultValue: [] });
    selection.select('a');
    expect(selection.isSelected('a')).toBe(true);
    dispose();
    collection.destroy();
    selection.destroy();
  });
});

describe('state DOM attributes', () => {
  it('serializes multiple states', () => {
    let snapshot = createStateSet();
    snapshot = addState(snapshot, 'disabled');
    snapshot = addState(snapshot, 'loading');
    const attrs = statesToDomAttributes(snapshot);
    expect(attrs['data-cui-state']).toBe('disabled loading');
    expect(attrs['aria-busy']).toBe('true');
    expect(attrs['aria-disabled']).toBe('true');
  });
});

describe('buildPartAttributes', () => {
  it('emits kebab-case part names', () => {
    const attrs = buildPartAttributes({
      componentId: 'button',
      partName: 'leadingIcon',
      variant: 'primary',
    });
    expect(attrs['data-cui-part']).toBe('leading-icon');
    expect(attrs['data-cui-variant']).toBe('primary');
  });
});

describe('createCelestialRuntime SSR isolation', () => {
  it('creates independent runtimes', () => {
    const a = createCelestialRuntime({
      environment: createNullEnvironment(),
      id: 'a',
    });
    const b = createCelestialRuntime({
      environment: createNullEnvironment(),
      id: 'b',
    });
    expect(a.id).not.toBe(b.id);
    a.destroy();
    b.destroy();
  });
});

describe('version constants', () => {
  it('exposes schema versions', () => {
    expect(SPEC_SCHEMA_VERSION).toBe('1.1.0');
    expect(CONTRACT_SCHEMA_VERSION).toBe('1.1.0');
  });
});
