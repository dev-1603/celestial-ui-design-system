import * as fs from 'node:fs';
import * as path from 'node:path';
import { createThemeRegistry, resolveTheme, CELESTIAL_THEME } from '@celestial-ui/theme';
import { compileThemeSet } from '../compiler';
import { generateBaseCss } from '../base';
import { generateTailwindBridge } from '../tailwind';
import { generateShadcnAdapter } from '../shadcn';

const distCssDir = path.join(__dirname, '..', '..', 'css');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrote ${filePath}`);
}

function build(): void {
  ensureDir(distCssDir);

  const registry = createThemeRegistry([CELESTIAL_THEME]);
  const light = resolveTheme(registry, { themeId: 'celestial', mode: 'light' });
  const dark = resolveTheme(registry, { themeId: 'celestial', mode: 'dark' });

  const compiled = compileThemeSet([light, dark], {
    scope: { kind: 'document' },
    includeMetadataComment: true,
  });

  writeFile(path.join(distCssDir, 'index.css'), compiled.cssText);
  writeFile(
    path.join(distCssDir, 'base.css'),
    [generateBaseCss({ mode: 'light' }), generateBaseCss({ mode: 'dark' })].join('\n'),
  );
  writeFile(path.join(distCssDir, 'tailwind.css'), generateTailwindBridge());
  writeFile(
    path.join(distCssDir, 'shadcn.css'),
    [
      generateShadcnAdapter(undefined, { mode: 'light' }),
      generateShadcnAdapter(undefined, { mode: 'dark' }),
    ].join('\n'),
  );
}

build();
