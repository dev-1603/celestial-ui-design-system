import { describe, it, expect } from 'vitest';
import { getContrastRatio, meetsContrastAA, parseColorToRGBA, compositeColors } from './a11y';

describe('Accessibility Contrast Checking', () => {
  it('should parse hex correctly', () => {
    expect(parseColorToRGBA('#FFFFFF')).toEqual([255, 255, 255, 1]);
    expect(parseColorToRGBA('#000000')).toEqual([0, 0, 0, 1]);
    expect(parseColorToRGBA('#FFF')).toEqual([255, 255, 255, 1]);
    expect(parseColorToRGBA('#00000080')).toEqual([0, 0, 0, 0.5019607843137255]);
  });

  it('should parse rgba correctly', () => {
    expect(parseColorToRGBA('rgba(0, 0, 0, 0.4)')).toEqual([0, 0, 0, 0.4]);
    expect(parseColorToRGBA('rgb(255, 255, 255)')).toEqual([255, 255, 255, 1]);
  });

  it('should calculate contrast ratio correctly', () => {
    const ratioWhiteBlack = getContrastRatio('#FFFFFF', '#000000');
    expect(ratioWhiteBlack).toBeCloseTo(21.0, 1);
    
    // Very dark gray and black
    const ratioDark = getContrastRatio('#111111', '#000000');
    expect(ratioDark).toBeLessThan(4.5);
  });

  it('should composite alpha colors correctly for contrast', () => {
    // 50% black over white should be gray
    const composited = compositeColors([0, 0, 0, 0.5], [255, 255, 255, 1]);
    expect(composited).toEqual([128, 128, 128]);

    // Contrast of 50% black text on white background should match gray on white
    const ratioAlpha = getContrastRatio('rgba(0,0,0,0.5)', '#FFFFFF');
    const ratioGray = getContrastRatio('#808080', '#FFFFFF');
    expect(ratioAlpha).toBeCloseTo(ratioGray, 1);
  });

  it('should evaluate AA thresholds', () => {
    expect(meetsContrastAA(4.5)).toBe(true);
    expect(meetsContrastAA(4.49)).toBe(false);
    expect(meetsContrastAA(3.0, true)).toBe(true); // Large text
    expect(meetsContrastAA(2.9, true)).toBe(false);
  });
});
