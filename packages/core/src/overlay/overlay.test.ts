import { describe, it, expect } from 'vitest';
import { createOverlayController, getTopOverlay } from '../overlay/overlay';

describe('overlay stack', () => {
  it('nests overlays LIFO for escape dismiss', () => {
    const a = createOverlayController({ modal: true });
    const b = createOverlayController({ modal: true });
    a.open();
    b.open();
    expect(getTopOverlay()).toBe(b);
    b.requestDismiss('escape');
    expect(b.getSnapshot().open).toBe(false);
    expect(a.getSnapshot().open).toBe(true);
    a.destroy();
    b.destroy();
  });
});
