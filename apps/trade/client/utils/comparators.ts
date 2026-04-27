import { BigNumber } from 'bignumber.js';

/**
 * Boolean comparator that sorts `true` before `false`
 *
 * @param a
 * @param b
 */
export function booleanComparator(a: boolean, b: boolean): number {
  return a === b ? 0 : a ? -1 : 1;
}

/**
 * BigNumber comparator that sorts in ascending order. Undefined values sort last.
 */
export function bigNumberComparator(
  a: BigNumber | undefined,
  b: BigNumber | undefined,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a.comparedTo(b) ?? 0;
}

export type SortablePrimitive = string | number | boolean | bigint;

/**
 * Primitive comparator that sorts primitive values (string, number, boolean, bigint) in ascending order
 *
 * @param a
 * @param b
 */
export function primitiveComparator(
  a: SortablePrimitive,
  b: SortablePrimitive,
): number {
  return a == b ? 0 : a > b ? 1 : -1;
}
