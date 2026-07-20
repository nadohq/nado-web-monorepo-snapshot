import { useSearchParams } from 'next/navigation';

const MARKET_NAME_QUERY_PARAM_KEY = 'market';

export function useMarketNameFromSearchParams() {
  const searchParams = useSearchParams();
  const marketName = searchParams.get(MARKET_NAME_QUERY_PARAM_KEY);

  return marketName?.toLowerCase();
}
