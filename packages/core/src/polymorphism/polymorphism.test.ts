import { describe, it, expect } from 'vitest';
import { resolvePolymorphicTag, filterPropsForTag } from '../polymorphism/polymorphism';

describe('polymorphism', () => {
  it('resolves as prop to allowed tag', () => {
    const tag = resolvePolymorphicTag({ nativeTag: 'button', allowedAs: ['button', 'a'] }, 'a');
    expect(tag).toBe('a');
  });

  it('filters props for anchor', () => {
    const filtered = filterPropsForTag('a', {
      href: '/patients',
      type: 'button',
      'aria-label': 'Patients',
    });
    expect(filtered.href).toBe('/patients');
    expect(filtered.type).toBeUndefined();
    expect(filtered['aria-label']).toBe('Patients');
  });
});
