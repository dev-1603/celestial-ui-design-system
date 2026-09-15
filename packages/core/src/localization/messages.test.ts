import { describe, it, expect } from 'vitest';
import { resolveMessage } from '../localization/messages';

describe('localization', () => {
  it('returns empty string for missing keys in production mode', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    expect(resolveMessage('closeLabel')).toBe('');
    process.env.NODE_ENV = prev;
  });

  it('resolves provided messages', () => {
    expect(resolveMessage('closeLabel', { messages: { closeLabel: 'Fermer' } })).toBe('Fermer');
  });
});
