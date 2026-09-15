import type { ResolvedTheme } from '@celestial-ui/theme';
import type { Token } from '@celestial-ui/tokens';
import { styleError, StyleCompilationError } from './errors';
import type { StyleError } from './errors';
import { formatTokenDeclarations } from './format-value';
import { compareUtf16, computeContentHash } from './hash';
import { SEMANTIC_CSS_REGISTRY } from './semantic-registry';
import { buildMetadataComment, serializeLayeredCss } from './serializer';
import { buildScopeSelector, getScopeKey } from './scope';
import { tokenPathToVariableName } from './variable-registry';
import type { CompileThemeOptions, CompiledThemeCss } from './types';
import { SEMANTIC_CSS_API_VERSION, STYLES_PACKAGE_VERSION } from './types';

function validateResolvedTheme(theme: Readonly<ResolvedTheme>): StyleError[] {
  const errors: StyleError[] = [];
  if (!theme.themeId || !theme.mode || !theme.tokens) {
    errors.push(styleError('INVALID_RESOLVED_THEME', 'ResolvedTheme is missing required fields'));
  }
  if (!theme.validation?.isValid) {
    errors.push(
      styleError('INVALID_RESOLVED_THEME', 'ResolvedTheme validation.isValid must be true'),
    );
  }
  return errors;
}

function tokenCssEntries(path: string, token: Token): Array<readonly [string, string]> {
  const formatted = formatTokenDeclarations(path, token);
  if ('__single__' in formatted) {
    return [[tokenPathToVariableName(path), formatted.__single__!]];
  }
  return Object.entries(formatted).map(([subKey, value]) => [
    `${tokenPathToVariableName(path)}-${subKey}`,
    value,
  ]);
}

function assignVariable(
  variables: Record<string, string>,
  owners: Map<string, string>,
  name: string,
  value: string,
  owner: string,
  errors: StyleError[],
): void {
  const existing = owners.get(name);
  if (existing !== undefined && existing !== owner) {
    errors.push(
      styleError(
        'VARIABLE_COLLISION',
        `CSS variable ${name} collides between "${existing}" and "${owner}"`,
        { path: owner },
      ),
    );
    return;
  }
  owners.set(name, owner);
  variables[name] = value;
}

function compileDeclarations(
  theme: Readonly<ResolvedTheme>,
  options: CompileThemeOptions,
): { variables: Record<string, string>; errors: StyleError[] } {
  const variables: Record<string, string> = {};
  const owners = new Map<string, string>();
  const errors: StyleError[] = [];
  const includeCompat = options.includeCompatibilityVariables !== false;
  const includeSemantic = options.includeSemanticVariables !== false;
  const formattedByPath = new Map<string, Array<readonly [string, string]>>();

  const sortedPaths = Object.keys(theme.tokens).sort(compareUtf16);

  for (const path of sortedPaths) {
    const token = theme.tokens[path];
    if (!token) continue;
    try {
      const entries = tokenCssEntries(path, token);
      formattedByPath.set(path, entries);
      if (includeCompat) {
        for (const [name, value] of entries) {
          assignVariable(variables, owners, name, value, path, errors);
        }
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        errors.push(err as StyleError);
      } else {
        throw err;
      }
    }
  }

  if (includeSemantic) {
    for (const [alias, tokenPath] of Object.entries(SEMANTIC_CSS_REGISTRY)) {
      const token = theme.tokens[tokenPath];
      if (!token) {
        errors.push(
          styleError('SEMANTIC_TOKEN_MISSING', `Semantic target missing: ${tokenPath}`, {
            path: tokenPath,
          }),
        );
        continue;
      }

      const internalName = tokenPathToVariableName(tokenPath);
      const entries = formattedByPath.get(tokenPath) ?? tokenCssEntries(tokenPath, token);
      const primary = entries.find(([name]) => name === internalName);
      const resolvedValue = primary?.[1];

      if (resolvedValue === undefined) {
        errors.push(
          styleError(
            'SEMANTIC_TOKEN_MISSING',
            `Semantic target is not a scalar CSS value: ${tokenPath}`,
            {
              path: tokenPath,
            },
          ),
        );
        continue;
      }

      if (alias === internalName) {
        if (!includeCompat) {
          assignVariable(variables, owners, alias, resolvedValue, tokenPath, errors);
        }
        continue;
      }

      const value = includeCompat ? `var(${internalName})` : resolvedValue;
      assignVariable(variables, owners, alias, value, `semantic:${alias}`, errors);
    }
  }

  return { variables, errors };
}

function compiledStyleId(options: CompileThemeOptions): string {
  return `cui-style-${getScopeKey(options.scope)}`;
}

/**
 * Compile a single resolved theme into scoped CSS custom properties.
 */
export function compileResolvedTheme(
  theme: Readonly<ResolvedTheme>,
  options: CompileThemeOptions,
): CompiledThemeCss {
  const validationErrors = validateResolvedTheme(theme);
  const { variables, errors: compileErrors } = compileDeclarations(theme, options);
  const allErrors = [...validationErrors, ...compileErrors];

  if (allErrors.length > 0) {
    throw new StyleCompilationError(allErrors);
  }

  const selector = buildScopeSelector(options.scope, theme.themeId, theme.mode);
  const styleId = compiledStyleId(options);
  const metadata = {
    themeId: theme.themeId,
    themeVersion: theme.themeVersion,
    mode: theme.mode,
    themeSchemaVersion: theme.schemaVersion,
    tokenSystemVersion: theme.tokenSystemVersion,
    semanticCssApiVersion: SEMANTIC_CSS_API_VERSION,
    stylesPackageVersion: STYLES_PACKAGE_VERSION,
  };

  const hashMeta: Record<string, string> = {
    themeId: metadata.themeId,
    mode: metadata.mode,
    semanticCssApiVersion: metadata.semanticCssApiVersion,
  };

  const contentHash = computeContentHash(variables, selector, hashMeta);
  let cssText = serializeLayeredCss(selector, variables);

  if (options.includeMetadataComment) {
    cssText = `${buildMetadataComment(hashMeta)}\n${cssText}`;
  }

  return {
    cssText,
    variables: Object.freeze({ ...variables }),
    selector,
    styleId,
    contentHash,
    metadata,
  };
}

/**
 * Compile multiple resolved themes (e.g. light + dark) into one CSS artifact.
 *
 * `cssText` is the authoritative multi-mode stylesheet (one block per mode).
 * `variables` is a convenience map of the **last** theme in `themes` after
 * sequential merge — not a dual-mode source of truth.
 */
export function compileThemeSet(
  themes: readonly Readonly<ResolvedTheme>[],
  options: CompileThemeOptions,
): CompiledThemeCss {
  if (themes.length === 0) {
    throw new StyleCompilationError(
      styleError('MODE_SET_INCOMPLETE', 'compileThemeSet requires at least one theme'),
    );
  }

  const themeIds = new Set(themes.map((t) => t.themeId));
  if (themeIds.size > 1) {
    throw new StyleCompilationError(
      styleError('INVALID_RESOLVED_THEME', 'All themes in a set must share the same themeId'),
    );
  }

  const blocks: string[] = [];
  const mergedVariables: Record<string, string> = {};
  let primary: CompiledThemeCss | undefined;
  const innerOptions: CompileThemeOptions = { ...options, includeMetadataComment: false };

  for (const theme of themes) {
    const compiled = compileResolvedTheme(theme, innerOptions);
    blocks.push(compiled.cssText);
    Object.assign(mergedVariables, compiled.variables);
    if (!primary) primary = compiled;
  }

  const metadata = primary!.metadata;
  const selector = blocks.length === 1 ? primary!.selector : `:where(/* multi-mode */)`;
  const hashMeta: Record<string, string> = {
    themeId: metadata.themeId,
    modes: themes
      .map((t) => t.mode)
      .sort(compareUtf16)
      .join(','),
    semanticCssApiVersion: metadata.semanticCssApiVersion,
  };
  const contentHash = computeContentHash(mergedVariables, selector, hashMeta);

  let cssText = blocks.join('\n\n');
  if (options.includeMetadataComment) {
    cssText = `${buildMetadataComment(hashMeta)}\n${cssText}`;
  }

  return {
    cssText,
    variables: Object.freeze(mergedVariables),
    selector,
    styleId: primary!.styleId,
    contentHash,
    metadata,
  };
}

/** @internal Generate semantic-only declarations from a resolved theme. */
export function generateSemanticVariables(theme: Readonly<ResolvedTheme>): Record<string, string> {
  const { variables, errors } = compileDeclarations(theme, {
    scope: { kind: 'document' },
    includeCompatibilityVariables: false,
    includeSemanticVariables: true,
  });
  if (errors.length > 0) {
    throw new StyleCompilationError(errors);
  }
  return variables;
}
