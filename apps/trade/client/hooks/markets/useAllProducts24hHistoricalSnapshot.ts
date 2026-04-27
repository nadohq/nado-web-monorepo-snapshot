import { TimeInSeconds } from '@nadohq/client';
import { useQueryAllProductsHistoricalSnapshots } from 'client/hooks/query/markets/useQueryAllProductsHistoricalSnapshots';

/**
 * Util fn for retrieving product snapshots 24hr into the past
 * This is useful for standardizing cached data for queries
 */
export function useAllProducts24hHistoricalSnapshot() {
  const res = useQueryAllProductsHistoricalSnapshots([TimeInSeconds.DAY]);

  return { ...res, data: res.data?.[0] };
}
