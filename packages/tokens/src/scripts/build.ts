import * as fs from 'fs';
import * as path from 'path';
import { validateTokens } from '../validation';
import { flattenTokens, resolveAliases } from '../resolve';
import {
  generateCSS,
  generateTailwindPreset,
  generateTS,
  generateShadcnMapping,
} from '../generators';
import { TokenConfig } from '../types';

const dataDir = path.resolve(__dirname, '../../data');
const distDir = path.resolve(__dirname, '../../dist');
const cssDir = path.join(distDir, 'css');

// Load base JSON data
const primitives = JSON.parse(fs.readFileSync(path.join(dataDir, 'primitives.json'), 'utf8'));
const foundations = JSON.parse(fs.readFileSync(path.join(dataDir, 'foundations.json'), 'utf8'));
const components = JSON.parse(fs.readFileSync(path.join(dataDir, 'components.json'), 'utf8'));

// Load themes
const lightTheme = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'themes/celestial/light.json'), 'utf8'),
);
const darkTheme = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'themes/celestial/dark.json'), 'utf8'),
);

// Ensure dist directories exist
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });

// Combine into single configs for validation/generation
const baseConfig: TokenConfig = { ...primitives, ...foundations, ...components };
const lightConfig: TokenConfig = { ...baseConfig, ...lightTheme };
const darkConfig: TokenConfig = { ...baseConfig, ...darkTheme };

console.log('Validating celestial tokens (Light Mode)...');
const reportLight = validateTokens(lightConfig);
if (!reportLight.isValid) {
  console.error('Light theme validation failed:');
  reportLight.errors.forEach((e) => console.error(` - ${e}`));
  process.exit(1);
}

console.log('Validating celestial tokens (Dark Mode)...');
const reportDark = validateTokens(darkConfig);
if (!reportDark.isValid) {
  console.error('Dark theme validation failed:');
  reportDark.errors.forEach((e) => console.error(` - ${e}`));
  process.exit(1);
}

console.log('Tokens are valid. Resolving aliases...');
const resolvedLight = resolveAliases(flattenTokens(lightConfig));
const resolvedDark = resolveAliases(flattenTokens(darkConfig));

console.log('Generating CSS variables...');
// Base CSS (Primitives, Foundations, Components - we extract these from resolvedLight)
const baseTokens = Object.fromEntries(
  Object.entries(resolvedLight).filter(
    ([_, token]) =>
      token.$extensions?.celestial?.layer !== 'semantic' &&
      token.$extensions?.celestial?.layer !== 'component',
  ),
);
const semanticLightTokens = Object.fromEntries(
  Object.entries(resolvedLight).filter(
    ([_, token]) =>
      token.$extensions?.celestial?.layer === 'semantic' ||
      token.$extensions?.celestial?.layer === 'component',
  ),
);
const semanticDarkTokens = Object.fromEntries(
  Object.entries(resolvedDark).filter(
    ([_, token]) =>
      token.$extensions?.celestial?.layer === 'semantic' ||
      token.$extensions?.celestial?.layer === 'component',
  ),
);

// We output a merged CSS for ease of use in V1
let mergedCss = generateCSS(baseTokens);
// Append light theme semantics
mergedCss +=
  '\n/* Light Theme */\n' + generateCSS(semanticLightTokens).replace(':root {', ':root, .light {');
// Append dark theme semantics
mergedCss += '\n/* Dark Theme */\n' + generateCSS(semanticDarkTokens).replace(':root {', '.dark {');

fs.writeFileSync(path.join(cssDir, 'tokens.css'), mergedCss);

console.log('Generating Shadcn Mapping...');
const shadcnCss = generateShadcnMapping(resolvedLight); // Shadcn uses the same variable names, just maps to them
fs.writeFileSync(path.join(cssDir, 'shadcn-mapping.css'), shadcnCss);

console.log('Generating Tailwind preset...');
const tailwind = generateTailwindPreset(resolvedLight); // Tailwind config uses variable names, so light/dark works automatically
fs.writeFileSync(path.join(distDir, 'tailwind.preset.js'), tailwind);

console.log('Generating TypeScript tokens...');
const ts = generateTS(resolvedLight);
fs.writeFileSync(path.join(distDir, 'resolved.ts'), ts);

// Write resolved JSON for external consumers
fs.writeFileSync(path.join(distDir, 'tokens-light.json'), JSON.stringify(resolvedLight, null, 2));
fs.writeFileSync(path.join(distDir, 'tokens-dark.json'), JSON.stringify(resolvedDark, null, 2));

console.log('Build completed successfully.');
