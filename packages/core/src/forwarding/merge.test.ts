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
    expect(merged['aria-label']).toBe('User label');
    expect(merged['data-cui-state']).toBe('disabled');
  });
});
