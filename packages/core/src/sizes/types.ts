/**
 * First-class size contract for components that expose a size dimension.
 *
 * Components without a meaningful size axis must omit this contract entirely.
 */
export interface SizeContract {
  /** Declared size tokens (e.g. sm, md, lg). */
  readonly sizes: readonly string[];
  /** Default size when none is provided. Must be a member of `sizes`. */
  readonly defaultSize: string;
  /** Human-readable label for the size dimension (optional). */
  readonly dimension?: string;
}

export function isValidSizeValue(contract: SizeContract, value: string): boolean {
  return contract.sizes.includes(value);
}

export function resolveSizeValue(contract: SizeContract, value: string | undefined): string {
  if (value !== undefined && isValidSizeValue(contract, value)) {
    return value;
  }
  return contract.defaultSize;
}
