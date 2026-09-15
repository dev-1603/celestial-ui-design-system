import { CORE_PACKAGE_VERSION, createDisclosure } from '@celestial-ui/core';
import { createDisclosure as behaviorDisclosure } from '@celestial-ui/core/behavior';
import type { ComponentContract } from '@celestial-ui/core/contracts';
import { buttonSpec } from '@celestial-ui/core/specs/button';
import { flattenTokens } from '@celestial-ui/tokens/resolve';
import { CELESTIAL_THEME } from '@celestial-ui/theme/themes/celestial';
import { resolveTheme } from '@celestial-ui/theme/resolve';
import { createThemeStyleManager } from '@celestial-ui/styles/runtime';
import { resolveIcon } from '@celestial-ui/icons';

const _contract: ComponentContract | undefined = undefined;

// Referencing every subpath import here is the point of this fixture: tsc must
// successfully resolve and type-check each `@celestial-ui/*` entry point. The
// values themselves are unused, so we assign them to discarded bindings rather
// than using the `void` operator (flagged by typescript:S3735).
const _checks = [
  _contract,
  CORE_PACKAGE_VERSION,
  createDisclosure,
  behaviorDisclosure,
  buttonSpec,
  flattenTokens,
  CELESTIAL_THEME,
  resolveTheme,
  createThemeStyleManager,
  resolveIcon,
];
