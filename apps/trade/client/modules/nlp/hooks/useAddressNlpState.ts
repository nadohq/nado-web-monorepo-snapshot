import { NLP_PRODUCT_ID } from '@nadohq/client';
import { safeDiv, useNlp30dSnapshots } from '@nadohq/react-client';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { useMemo } from 'react';

export function useAddressNlpState() {
  const { latestSnapshot } = useNlp30dSnapshots();
  const { balances } = useSpotBalances();

  return useMemo(() => {
    const balanceAmount = balances?.find((balance) => {
      return balance.productId === NLP_PRODUCT_ID;
    })?.amount;

    const balanceValueUsd = (() => {
      if (!latestSnapshot) {
        return undefined;
      }

      return balanceAmount?.multipliedBy(latestSnapshot.oraclePrice);
    })();

    const shareOfPool = (() => {
      if (
        !balanceAmount ||
        !latestSnapshot ||
        // Return undefined if fraction result would be greater than 1
        // This is possible if the latest subaccount data is out of sync with snapshot data
        balanceAmount.gt(latestSnapshot.tvl)
      ) {
        return undefined;
      }

      return safeDiv(balanceAmount, latestSnapshot.tvl);
    })();

    return {
      balanceAmount,
      balanceValueUsd,
      shareOfPool,
    };
  }, [latestSnapshot, balances]);
}
