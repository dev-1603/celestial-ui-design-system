import { TokenConfig, ValidationReport } from './types';
import { flattenTokens, resolveAliases } from './resolve';
import { getContrastRatio, meetsContrastAA } from './a11y';

export function validateTokens(config: TokenConfig): ValidationReport {
  const report: ValidationReport = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  let resolvedTokens;

  try {
    const flatTokens = flattenTokens(config);
    resolvedTokens = resolveAliases(flatTokens);
  } catch (error: any) {
    report.isValid = false;
    report.errors.push(error.message);
    return report;
  }

  // A11y Validation logic based on metadata
  for (const [key, token] of Object.entries(resolvedTokens)) {
    const extensions = token.$extensions?.celestial;
    if (extensions?.a11ySensitive && extensions?.contrastPairs) {
      if (token.$type !== 'color') {
        report.warnings.push(`Token '${key}' is marked a11ySensitive but is not a color type.`);
        continue;
      }

      const fgHex = token.$value as string;

      for (const bgKey of extensions.contrastPairs) {
        const bgToken = resolvedTokens[bgKey];
        if (!bgToken) {
          report.errors.push(
            `A11y violation: Token '${key}' specifies contrast pair '${bgKey}' which does not exist.`,
          );
          report.isValid = false;
          continue;
        }

        if (bgToken.$type !== 'color') {
          report.errors.push(
            `A11y violation: Token '${key}' contrast pair '${bgKey}' is not a color.`,
          );
          report.isValid = false;
          continue;
        }

        const bgHex = bgToken.$value as string;

        try {
          const ratio = getContrastRatio(fgHex, bgHex);
          // TODO: Enhance metadata to specify if large text is expected. For now, default normal text.
          if (!meetsContrastAA(ratio)) {
            report.isValid = false;
            report.errors.push(
              `A11y violation: '${key}' (${fgHex}) and '${bgKey}' (${bgHex}) do not meet WCAG 2.2 AA (Ratio: ${ratio.toFixed(2)}:1)`,
            );
          }
        } catch (e: any) {
          report.warnings.push(`Could not check contrast for '${key}' vs '${bgKey}': ${e.message}`);
        }
      }
    }
  }

  return report;
}
