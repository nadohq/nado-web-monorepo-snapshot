import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { sortByValueAndLimit } from 'client/pages/Markets/utils/sortByValueAndLimit';
import { useMemo } from 'react';

/**
 * The top 6 markets' deposit rates descending order
 */
export function useMarketsDepositRates() {
  const { balances, isLoading } = useSpotBalances();
  const isConnected = useIsConnected();

  const depositRates = useMemo(() => {
    if (!balances) {
      return;
    }

    return sortByValueAndLimit(Object.values(balances), 'depositAPY');
  }, [balances]);

  return {
    depositRates,
    isLoading,
    isConnected,
  };
}
