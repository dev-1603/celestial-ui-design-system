import { afterEach, describe, expect, it } from 'vitest';
import { createFormFieldState } from './field';
import { _resetIdCounter } from '../ids';

describe('createFormFieldState', () => {
  afterEach(() => {
    _resetIdCounter();
  });

  it('assigns sequential createId-based control ids', () => {
    _resetIdCounter();
    const first = createFormFieldState({ defaultValue: '' });
    const second = createFormFieldState({ defaultValue: '' });
    expect(first.getSnapshot().controlId).toBe('cui-field-1');
    expect(second.getSnapshot().controlId).toBe('cui-field-2');
    expect(first.getSnapshot().labelId).toBe('cui-field-1-label');
  });
});
