import { Row, SortingFn } from '@tanstack/react-table';
import { BigNumber } from 'bignumber.js';
import {
  bigNumberComparator,
  primitiveComparator,
  SortablePrimitive,
} from 'client/utils/comparators';

/**
 * A sort fn that uses the value of `context.getValue()` of the current column.
 * Should be used if `context.getValue()` returns a `BigNumber`
 * @param a First row to compare
 * @param b Second row to compare
 * @param columnId The column identifier
 * @returns Comparison result (-1, 0, or 1)
 */
export function bigNumberSortFn<T>(
  a: Row<T>,
  b: Row<T>,
  columnId: string,
): number {
  return bigNumberComparator(a.getValue(columnId), b.getValue(columnId));
}

/**
 * A sort fn that uses the value of `context.getValue()` of the current column
 * Should be used if `context.getValue()` returns a boolean value (e.g. isFavorited)
 * True is considered greater than false, so it will sort true values to the top
 */
export function booleanSortFn<T>(
  a: Row<T>,
  b: Row<T>,
  columnId: string,
): number {
  // true -> 1, false -> 0
  return Number(b.getValue(columnId)) - Number(a.getValue(columnId));
}

/**
 * A sort fn factory that uses a nested value of `context.getValue()` of the current column.
 * Should be used if `context.getValue()` returns an object with `BigNumber` values
 * @param keyOfColumnValue The key to access within the column value object
 * @returns A sorting function for the specified key
 */
export function getKeyedBigNumberSortFn<T>(
  keyOfColumnValue: string,
): SortingFn<T> {
  const sortFn: SortingFn<T> = (a, b, columnId) => {
    // Column values can be nullable, so we need to handle that case with the "?." accessor.
    const valueA =
      a.getValue<Record<string, BigNumber>>(columnId)?.[keyOfColumnValue];
    const valueB =
      b.getValue<Record<string, BigNumber>>(columnId)?.[keyOfColumnValue];

    return bigNumberComparator(valueA, valueB);
  };
  return sortFn;
}

/**
 * A sort fn factory that takes in a callback of `(rowValues) => BigNumber`.
 * Used to retrieve a custom `BigNumber` to sort by
 * @param valueExtractor Function to extract BigNumber value from row
 * @returns A sorting function using the extracted values
 */
export function getCustomGetterBigNumberSortFn<T>(
  valueExtractor: (row: Row<T>) => BigNumber,
): SortingFn<T> {
  const sortFn: SortingFn<T> = (a, b) => {
    const valueA = valueExtractor(a);
    const valueB = valueExtractor(b);
    return bigNumberComparator(valueA, valueB);
  };
  return sortFn;
}

/**
 * A sort fn factory that uses a nested value of `context.getValue()` for the current column.
 * Should be used when sorting a primitive value (ie. string | number | boolean | bigint).
 */
export function getKeyedPrimitiveSortFn<T>(
  keyOfColumnValue: string,
): SortingFn<T> {
  const sortFn: SortingFn<T> = (a, b, columnId) => {
    // Column values can be nullable, so we need to handle that case with the "?." accessor.
    const valueA =
      a.getValue<Record<string, SortablePrimitive>>(columnId)?.[
        keyOfColumnValue
      ];
    const valueB =
      b.getValue<Record<string, SortablePrimitive>>(columnId)?.[
        keyOfColumnValue
      ];

    return primitiveComparator(valueA, valueB);
  };
  return sortFn;
}

/**
 * A sort fn factory that takes in a callback of `(rowValues) => SortablePrimitive`.
 * Used to retrieve a custom primitive value to sort by.
 * @param valueExtractor Function to extract primitive value from row
 * @returns A sorting function using the extracted values
 */
export function getCustomGetterPrimitiveSortFn<T>(
  valueExtractor: (row: Row<T>) => SortablePrimitive,
): SortingFn<T> {
  const sortFn: SortingFn<T> = (a, b) => {
    const valueA = valueExtractor(a);
    const valueB = valueExtractor(b);

    return primitiveComparator(valueA, valueB);
  };
  return sortFn;
}
