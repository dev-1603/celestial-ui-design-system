export type Direction = 'ltr' | 'rtl';

export type LogicalKey = 'next' | 'prev' | 'start' | 'end' | 'up' | 'down' | 'home' | 'end-of-list';

const LTR_HORIZONTAL: Record<string, LogicalKey | null> = {
  ArrowRight: 'next',
  ArrowLeft: 'prev',
  ArrowDown: 'down',
  ArrowUp: 'up',
  Home: 'home',
  End: 'end-of-list',
};

const RTL_HORIZONTAL: Record<string, LogicalKey | null> = {
  ArrowRight: 'prev',
  ArrowLeft: 'next',
  ArrowDown: 'down',
  ArrowUp: 'up',
  Home: 'home',
  End: 'end-of-list',
};

export function getLogicalKeyMap(direction: Direction): Record<string, LogicalKey | null> {
  return direction === 'rtl' ? RTL_HORIZONTAL : LTR_HORIZONTAL;
}

export function resolveLogicalKey(key: string, direction: Direction): LogicalKey | null {
  return getLogicalKeyMap(direction)[key] ?? null;
}
