import { describe, it, expect } from 'vitest';
import { toAssetStem, toFontAwesomeExportName } from './names';

describe('[Unit] native name helpers', () => {
  it('should convert Heroicons PascalCase with digits to file stems', () => {
    expect(toAssetStem('Cog6Tooth')).toBe('cog-6-tooth');
    expect(toAssetStem('squares-2x2')).toBe('squares-2x2');
    expect(toAssetStem('MagnifyingGlass')).toBe('magnifying-glass');
    expect(toAssetStem('XMark')).toBe('x-mark');
    expect(toAssetStem('XCircle')).toBe('x-circle');
  });

  it('should convert Font Awesome kebab names to pack exports', () => {
    expect(toFontAwesomeExportName('magnifying-glass')).toBe('faMagnifyingGlass');
  });
});
