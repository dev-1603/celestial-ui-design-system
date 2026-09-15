import type { Token, TokenConfig, ValidationReport } from './types';
import { flattenTokens, resolveAliases, type FlatTokenMap } from './resolve';
import { getContrastRatio, meetsContrastAA } from './a11y';

function validateA11yContrastPair(
  key: string,
  fgHex: string,
  bgKey: string,
  resolvedTokens: FlatTokenMap,
  report: ValidationReport,
): void {
  const bgToken = resolvedTokens[bgKey];
  if (!bgToken) {
    report.errors.push(
      `A11y violation: Token '${key}' specifies contrast pair '${bgKey}' which does not exist.`,
    );
    report.isValid = false;
    return;
  }

  if (bgToken.$type !== 'color') {
    report.errors.push(`A11y violation: Token '${key}' contrast pair '${bgKey}' is not a color.`);
    report.isValid = false;
    return;
  }

  const bgHex = bgToken.$value as string;

  try {
    const ratio = getContrastRatio(fgHex, bgHex);
    // Large-text AA is not encoded on tokens yet; contrast uses the normal-text threshold.
    if (!meetsContrastAA(ratio)) {
      report.isValid = false;
      report.errors.push(
        `A11y violation: '${key}' (${fgHex}) and '${bgKey}' (${bgHex}) do not meet WCAG 2.2 AA (Ratio: ${ratio.toFixed(2)}:1)`,
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    report.warnings.push(`Could not check contrast for '${key}' vs '${bgKey}': ${message}`);
  }
}

function validateA11yToken(
  key: string,
  token: Token,
  resolvedTokens: FlatTokenMap,
  report: ValidationReport,
): void {
  const extensions = token.$extensions?.celestial;
  if (!extensions?.a11ySensitive || !extensions.contrastPairs) {
    return;
  }

  if (token.$type !== 'color') {
    report.warnings.push(`Token '${key}' is marked a11ySensitive but is not a color type.`);
    return;
  }

  const fgHex = token.$value as string;
  for (const bgKey of extensions.contrastPairs) {
    validateA11yContrastPair(key, fgHex, bgKey, resolvedTokens, report);
  }
}

export function validateTokens(config: TokenConfig): ValidationReport {
  const report: ValidationReport = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  let resolvedTokens: FlatTokenMap;

  try {
    const flatTokens = flattenTokens(config);
    resolvedTokens = resolveAliases(flatTokens);
  } catch (error: unknown) {
    report.isValid = false;
    report.errors.push(error instanceof Error ? error.message : String(error));
    return report;
  }

  for (const [key, token] of Object.entries(resolvedTokens)) {
    validateA11yToken(key, token, resolvedTokens, report);
  }

  return report;
}
