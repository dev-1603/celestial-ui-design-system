export interface PolymorphismPreset {
  readonly nativeTag: string;
  readonly role?: string;
  readonly allowedProps?: readonly string[];
}

export interface PolymorphismContract {
  readonly nativeTag: string;
  readonly allowedAs?: readonly string[];
  readonly presets?: Readonly<Record<string, PolymorphismPreset>>;
}
