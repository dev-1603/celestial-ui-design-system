import { describe, it, expect } from 'vitest';
import { mergeForwardedProps } from '../forwarding/merge';

describe('mergeForwardedProps', () => {
  it('prefers generated a11y over native except aria-label', () => {
    const merged = mergeForwardedProps({
      nativeProps: { 'aria-label': 'User label', id: 'x' },
      generatedA11y: { role: 'button', 'aria-label': 'Generated' },
      generatedState: { 'data-cui-state': 'disabled' },
    });
    expect(merged.role).toBe('button');
    expect(merged.id).toBe('x');
    expect(merged['aria-label']).toBe('User label');
    expect(merged['data-cui-state']).toBe('disabled');
  });

  it('keeps every key from the same source and lets later sources overwrite', () => {
    const merged = mergeForwardedProps({
      nativeProps: { id: 'native', class: 'n', title: 'native-title' },
      componentProps: { class: 'component', 'data-owned': 'yes' },
      generatedState: { 'data-cui-state': 'busy', title: 'state-title' },
      generatedA11y: { role: 'button', 'aria-busy': 'true' },
    });
    expect(merged).toEqual({
      id: 'native',
      class: 'component',
      title: 'state-title',
      'data-owned': 'yes',
      'data-cui-state': 'busy',
      role: 'button',
      'aria-busy': 'true',
    });
  });
});
