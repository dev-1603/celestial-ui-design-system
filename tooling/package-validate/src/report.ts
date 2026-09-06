import type { ValidationCategory, ValidationFinding, ValidationReport } from './types.js';

const CATEGORY_ORDER: ValidationCategory[] = [
  'build',
  'typecheck',
  'tests',
  'exports',
  'api',
  'artifacts',
  'consumer',
  'documentation',
  'dependency-graph',
  'security',
  'registry',
];

export function buildReport(input: {
  packagesDiscovered: number;
  publicPackages: number;
  privatePackages: number;
  internalPackages: number;
  findings: ValidationFinding[];
}): ValidationReport {
  const categories = {} as ValidationReport['categories'];

  for (const category of CATEGORY_ORDER) {
    const categoryFindings = input.findings.filter((finding) => finding.category === category);
    const hasRequired = categoryFindings.some(
      (f) => f.severity === 'BLOCKER' || f.severity === 'REQUIRED',
    );
    categories[category] = {
      status: hasRequired ? 'FAIL' : 'PASS',
      findings: categoryFindings,
    };
  }

  const hasBlocker = input.findings.some(
    (f) => f.severity === 'BLOCKER' || f.severity === 'REQUIRED',
  );

  return {
    generatedAt: new Date().toISOString(),
    packagesDiscovered: input.packagesDiscovered,
    publicPackages: input.publicPackages,
    privatePackages: input.privatePackages,
    internalPackages: input.internalPackages,
    categories,
    overall: hasBlocker ? 'NOT_RELEASE_READY' : 'RELEASE_READY',
    findings: input.findings,
  };
}

export function formatMarkdownReport(report: ValidationReport): string {
  const lines: string[] = [
    '# Celestial UI Validation',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Packages discovered: ${report.packagesDiscovered}`,
    `Public packages: ${report.publicPackages}`,
    `Private packages: ${report.privatePackages}`,
    `Internal packages: ${report.internalPackages}`,
    '',
    '## Summary',
    '',
    '| Check | Status |',
    '|-------|--------|',
  ];

  for (const category of CATEGORY_ORDER) {
    const status = report.categories[category].status;
    lines.push(`| ${category} | ${status} |`);
  }

  lines.push('', `**Overall:** ${report.overall}`, '');

  const failing = report.findings.filter(
    (f) => f.severity === 'BLOCKER' || f.severity === 'REQUIRED',
  );

  if (failing.length > 0) {
    lines.push('## Failures', '');
    for (const finding of failing) {
      lines.push(
        `### ${finding.package} — ${finding.category}`,
        '',
        `- **Severity:** ${finding.severity}`,
        `- **Reason:** ${finding.reason}`,
        `- **Remediation:** ${finding.remediation}`,
        '',
      );
    }
  } else {
    lines.push('All required checks passed.', '');
  }

  return lines.join('\n');
}
