export type KeyboardIntent =
  | 'next'
  | 'prev'
  | 'first'
  | 'last'
  | 'open'
  | 'close'
  | 'select'
  | 'typeahead'
  | 'activate'
  | 'dismiss';

export function resolveKeyboardIntent(
  key: string,
  options?: { shiftKey?: boolean },
): KeyboardIntent | null {
  switch (key) {
    case 'ArrowDown':
      return 'next';
    case 'ArrowUp':
      return 'prev';
    case 'ArrowRight':
      return options?.shiftKey ? null : 'next';
    case 'ArrowLeft':
      return options?.shiftKey ? null : 'prev';
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    case 'Enter':
    case ' ':
      return 'activate';
    case 'Escape':
      return 'dismiss';
    case 'Tab':
      return null;
    default:
      if (key.length === 1 && key >= ' ') {
        return 'typeahead';
      }
      return null;
  }
}

export function shouldActivateOnKey(key: string, role?: string): boolean {
  if (key === 'Enter') return true;
  if (key === ' ' && role !== 'link') return true;
  return false;
}
