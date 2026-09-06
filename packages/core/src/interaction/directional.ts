import type { Direction } from '../directionality/direction';
import { resolveLogicalKey } from '../directionality/direction';
import type { KeyboardIntent } from './keyboard';
import { resolveKeyboardIntent } from './keyboard';

export function resolveDirectionalIntent(
  key: string,
  direction: Direction,
  orientation: 'horizontal' | 'vertical' | 'both' = 'vertical',
): KeyboardIntent | null {
  const logical = resolveLogicalKey(key, direction);
  if (!logical) {
    return resolveKeyboardIntent(key);
  }
  switch (logical) {
    case 'next':
      return orientation === 'horizontal' ? 'next' : 'next';
    case 'prev':
      return orientation === 'horizontal' ? 'prev' : 'prev';
    case 'down':
      return orientation !== 'horizontal' ? 'next' : null;
    case 'up':
      return orientation !== 'horizontal' ? 'prev' : null;
    case 'home':
      return 'first';
    case 'end-of-list':
      return 'last';
    default:
      return resolveKeyboardIntent(key);
  }
}
