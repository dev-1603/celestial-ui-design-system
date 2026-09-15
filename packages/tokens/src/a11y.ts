/**
 * Utility to parse color and calculate relative luminance.
 * Uses WCAG 2.2 contrast formula.
 */

const RGB_COLOR_PATTERN = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;

function hexChannel(hex: string, start: number): number {
  return Number.parseInt(hex.slice(start, start + 2), 16);
}

export function parseColorToRGBA(color: string): [number, number, number, number] {
  color = color.trim().toLowerCase();

  // Handle Hex
  if (color.startsWith('#')) {
    let c = color.replace('#', '');
    if (c.length === 3 || c.length === 4) {
      c = c
        .split('')
        .map((char) => char + char)
        .join('');
    }
    if (c.length === 6) {
      return [hexChannel(c, 0), hexChannel(c, 2), hexChannel(c, 4), 1];
    }
    if (c.length === 8) {
      return [hexChannel(c, 0), hexChannel(c, 2), hexChannel(c, 4), hexChannel(c, 6) / 255];
    }
    throw new Error(`Invalid hex color: ${color}`);
  }

  // Handle rgb/rgba
  if (color.startsWith('rgb')) {
    const match = RGB_COLOR_PATTERN.exec(color);
    if (!match) throw new Error(`Invalid rgb/rgba color: ${color}`);
    return [
      Number.parseInt(match[1], 10),
      Number.parseInt(match[2], 10),
      Number.parseInt(match[3], 10),
      match[4] ? Number.parseFloat(match[4]) : 1,
    ];
  }

  // Handle transparent
  if (color === 'transparent') {
    return [0, 0, 0, 0];
  }

  // Fallback (for simplified token validation, assuming standard formats)
  throw new Error(`Unsupported color format: ${color}`);
}

/**
 * Composite a foreground color with alpha over an opaque background color.
 */
export function compositeColors(
  fgRGBA: [number, number, number, number],
  bgRGBA: [number, number, number, number],
): [number, number, number] {
  const [fR, fG, fB, fA] = fgRGBA;
  const [bR, bG, bB] = bgRGBA; // Assume background is opaque for this calculation

  const outA = fA + (1 - fA) * 1; // background alpha is 1
  if (outA === 0) return [0, 0, 0];

  const outR = Math.round((fR * fA + bR * 1 * (1 - fA)) / outA);
  const outG = Math.round((fG * fA + bG * 1 * (1 - fA)) / outA);
  const outB = Math.round((fB * fA + bB * 1 * (1 - fA)) / outA);

  return [outR, outG, outB];
}

export function getLuminance(r: number, g: number, b: number): number {
  const [R, G, B] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function opaqueRgb(rgba: [number, number, number, number]): [number, number, number] {
  return [rgba[0], rgba[1], rgba[2]];
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgba1 = parseColorToRGBA(color1);
  const rgba2 = parseColorToRGBA(color2);

  const bg = rgba2[3] < 1 ? compositeColors(rgba2, [255, 255, 255, 1]) : opaqueRgb(rgba2);
  const fg = rgba1[3] < 1 ? compositeColors(rgba1, [bg[0], bg[1], bg[2], 1]) : opaqueRgb(rgba1);

  const l1 = getLuminance(fg[0], fg[1], fg[2]);
  const l2 = getLuminance(bg[0], bg[1], bg[2]);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if the contrast ratio meets WCAG 2.2 AA standards.
 * @param ratio The computed contrast ratio
 * @param isLargeText True if checking contrast for large text (>= 18pt or >= 14pt bold), false for normal text.
 * @returns boolean indicating pass/fail
 */
export function meetsContrastAA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
