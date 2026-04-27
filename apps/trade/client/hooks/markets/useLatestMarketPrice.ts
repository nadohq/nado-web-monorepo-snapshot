import {
  LatestMarketPrice,
  useQueryAllMarketsLatestPrices,
} from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { QueryState } from 'client/types/QueryState';

interface Params {
  productId?: number;
}

export function useLatestMarketPrice({
  productId,
}: Params): QueryState<LatestMarketPrice> {
  const { data, ...rest } = useQueryAllMarketsLatestPrices();

  return {
    data: productId ? data?.[productId] : undefined,
    ...rest,
  };
}
