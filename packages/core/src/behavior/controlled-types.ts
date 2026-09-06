export interface ControlledFieldDefinition {
  readonly prop: string;
  readonly event: string;
}

export interface ControlledStateContract {
  readonly fields: readonly ControlledFieldDefinition[];
}
