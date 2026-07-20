import { BigNumberish, toBigNumber } from '@nadohq/client';
import { orderBy } from 'lodash';

interface Options {
  isAbsolute?: boolean;
  isAscending?: boolean;
  limit?: number;
}

export function sortByValueAndLimit<TData extends object>(
  data: TData[],
  sortKey: keyof TData,
  { limit = 6, isAbsolute, isAscending }: Options = {},
): TData[] {
  // Items without a value at `sortKey` can't be ranked meaningfully, so we
  // exclude them rather than letting them sort as NaN (which surfaces at the
  // top of a descending sort).
  const sortableData = data.filter((res) => res[sortKey] != null);

  return orderBy(
    sortableData,
    (res) => {
      const value = toBigNumber(res[sortKey] as BigNumberish);
      return (isAbsolute ? value.abs() : value).toNumber();
    },
    isAscending ? 'asc' : 'desc',
  ).slice(0, limit);
}
