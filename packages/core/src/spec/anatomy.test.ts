import { describe, it, expect } from 'vitest';
import { validateAnatomy } from './anatomy';

describe('validateAnatomy', () => {
  it('accepts consistent parts and refs', () => {
    const report = validateAnatomy({
      parts: {
        parts: {
          root: { name: 'root', required: true, refTarget: true },
        },
      },
      refs: {
        primary: 'root',
        targets: { root: { part: 'root' } },
      },
    });
    expect(report.isValid).toBe(true);
  });

  it('rejects duplicate part names', () => {
    const report = validateAnatomy({
      parts: {
        parts: {
          root: { name: 'root', required: true },
          duplicate: { name: 'root', required: false },
        },
      },
    });
    expect(report.isValid).toBe(false);
  });

  it('rejects refs pointing to unknown parts', () => {
    const report = validateAnatomy({
      parts: {
        parts: {
          root: { name: 'root', required: true },
        },
      },
      refs: {
        primary: 'missing',
        targets: { trigger: { part: 'missing' } },
      },
    });
    expect(report.isValid).toBe(false);
  });
});
