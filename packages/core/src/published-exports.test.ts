import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

function resolveExportTarget(pkgRoot: string, exportValue: unknown): string | null {
  if (typeof exportValue === 'string') {
    return path.join(pkgRoot, exportValue);
  }
  if (exportValue && typeof exportValue === 'object' && 'default' in exportValue) {
    const def = (exportValue as { default: string }).default;
    return path.join(pkgRoot, def);
  }
  return null;
}

describe('published export map', () => {
  const pkgRoot = path.join(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')) as {
    exports: Record<string, { default: string }>;
  };

  const expectedSubpaths = [
    '.',
    './contracts',
    './behavior',
    './accessibility',
    './collection',
    './overlay',
    './runtime',
    './catalog',
    './testing',
    './specs/accordion',
    './specs/action-bar',
    './specs/alert',
    './specs/alert-dialog',
    './specs/app-shell',
    './specs/aspect-ratio',
    './specs/avatar',
    './specs/badge',
    './specs/banner',
    './specs/blockquote',
    './specs/box',
    './specs/breadcrumb',
    './specs/button',
    './specs/calendar',
    './specs/callout',
    './specs/card',
    './specs/carousel',
    './specs/center',
    './specs/chart',
    './specs/checkbox',
    './specs/chip',
    './specs/code',
    './specs/collapsible',
    './specs/color-picker',
    './specs/combobox',
    './specs/command',
    './specs/container',
    './specs/context-menu',
    './specs/data-table',
    './specs/date-picker',
    './specs/date-range-picker',
    './specs/dialog',
    './specs/divider',
    './specs/drawer',
    './specs/dropdown-menu',
    './specs/dropzone',
    './specs/empty-state',
    './specs/figure',
    './specs/file-upload',
    './specs/flex',
    './specs/form',
    './specs/grid',
    './specs/heading',
    './specs/hero',
    './specs/hover-card',
    './specs/icon',
    './specs/image',
    './specs/input',
    './specs/input-otp',
    './specs/kbd',
    './specs/label',
    './specs/link',
    './specs/list',
    './specs/list-item',
    './specs/menubar',
    './specs/meter',
    './specs/navigation-menu',
    './specs/notice',
    './specs/number-input',
    './specs/page-header',
    './specs/page-layout',
    './specs/pagination',
    './specs/panel',
    './specs/password-input',
    './specs/phone-input',
    './specs/pin-input',
    './specs/popover',
    './specs/progress',
    './specs/radio-group',
    './specs/rating',
    './specs/resizable',
    './specs/scroll-area',
    './specs/search-input',
    './specs/segmented-control',
    './specs/select',
    './specs/separator',
    './specs/sheet',
    './specs/sidebar',
    './specs/skeleton',
    './specs/slider',
    './specs/sonner',
    './specs/spacer',
    './specs/spinner',
    './specs/stack',
    './specs/stat',
    './specs/stepper',
    './specs/switch',
    './specs/table',
    './specs/tabs',
    './specs/tag',
    './specs/text',
    './specs/textarea',
    './specs/time-picker',
    './specs/timeline',
    './specs/toast',
    './specs/toggle',
    './specs/toggle-group',
    './specs/toolbar',
    './specs/tooltip',
    './specs/transfer-list',
    './specs/tree',
    './specs/tree-view',
    './specs/video',
  ];

  it('declares all capability subpaths', () => {
    for (const subpath of expectedSubpaths) {
      expect(pkg.exports[subpath]).toBeDefined();
    }
  });

  it('does not export testing from root barrel source', () => {
    const rootSource = fs.readFileSync(path.join(pkgRoot, 'src/index.ts'), 'utf8');
    expect(rootSource).not.toContain('./testing');
  });

  it('resolves every export target on disk after build', () => {
    for (const [subpath, value] of Object.entries(pkg.exports)) {
      const target = resolveExportTarget(pkgRoot, value);
      expect(target, `missing target for ${subpath}`).not.toBeNull();
      expect(fs.existsSync(target!), `${subpath} -> ${target}`).toBe(true);
    }
  });
});
