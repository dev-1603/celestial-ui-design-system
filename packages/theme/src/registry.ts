import type { ThemeConfig } from './types';

export class ThemeRegistry {
  private readonly themes = new Map<string, ThemeConfig>();

  constructor(themes: ThemeConfig[] = []) {
    for (const theme of themes) {
      this.register(theme);
    }
  }

  register(theme: ThemeConfig): void {
    if (this.themes.has(theme.id)) {
      throw new Error(`Theme '${theme.id}' is already registered.`);
    }
    this.themes.set(theme.id, theme);
  }

  has(themeId: string): boolean {
    return this.themes.has(themeId);
  }

  get(themeId: string): ThemeConfig {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme '${themeId}' is not registered.`);
    }
    return theme;
  }

  list(): ThemeConfig[] {
    return [...this.themes.values()];
  }

  /** Returns inheritance chain root → leaf (e.g. celestial → acme → acme-nexus). */
  getInheritanceChain(themeId: string): ThemeConfig[] {
    const chain: ThemeConfig[] = [];
    const visited = new Set<string>();
    let currentId: string | undefined = themeId;

    while (currentId) {
      if (visited.has(currentId)) {
        throw new Error(`Inheritance cycle detected at '${currentId}'.`);
      }
      visited.add(currentId);
      const theme = this.get(currentId);
      chain.unshift(theme);
      currentId = theme.parentId;
    }

    return chain;
  }
}

export function createThemeRegistry(themes: ThemeConfig[] = []): ThemeRegistry {
  return new ThemeRegistry(themes);
}

export function defineTheme(theme: ThemeConfig): ThemeConfig {
  return theme;
}
