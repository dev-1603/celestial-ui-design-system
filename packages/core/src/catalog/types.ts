import type { ComponentId } from '../ids';
import type { ComponentCapability } from '../capabilities/types';

/** Atomic design taxonomy — classification metadata only. */
export type ComponentTaxonomy = 'atomic' | 'molecular' | 'organism' | 'template' | 'advanced';

/** Engineering family — does not determine package architecture. */
export type EngineeringFamily =
  | 'primitives'
  | 'forms'
  | 'navigation'
  | 'overlays'
  | 'collections'
  | 'layout'
  | 'feedback'
  | 'data-display'
  | 'media'
  | 'editors'
  | 'templates';

export type ComponentMetadataStatus = 'stable' | 'preview' | 'deprecated' | 'draft';

export interface ComponentMetadata {
  readonly displayName: string;
  readonly description?: string;
  readonly purpose?: string;
  readonly tags?: readonly string[];
  readonly status: ComponentMetadataStatus;
  readonly owner?: string;
  readonly taxonomy?: ComponentTaxonomy;
  readonly engineeringFamily?: EngineeringFamily;
  readonly complexity?: 'simple' | 'moderate' | 'complex';
}

export interface CatalogEntry {
  readonly id: ComponentId;
  readonly displayName: string;
  readonly purpose: string;
  readonly taxonomy: ComponentTaxonomy;
  readonly engineeringFamily: EngineeringFamily;
  readonly status: ComponentMetadataStatus;
  readonly specSchemaVersion: string;
  readonly contractSchemaVersion: string;
  readonly contractVersion: string;
  readonly capabilities: readonly ComponentCapability[];
}

export const COMPONENT_TAXONOMIES: readonly ComponentTaxonomy[] = [
  'atomic',
  'molecular',
  'organism',
  'template',
  'advanced',
] as const;

export const ENGINEERING_FAMILIES: readonly EngineeringFamily[] = [
  'primitives',
  'forms',
  'navigation',
  'overlays',
  'collections',
  'layout',
  'feedback',
  'data-display',
  'media',
  'editors',
  'templates',
] as const;
