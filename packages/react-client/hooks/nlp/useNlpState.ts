import { removeDecimals, toBigNumber } from '@nadohq/client';
import { useMemo } from 'react';
import { safeDiv } from '../../utils';
import { useNlp30dSnapshots } from './useNlp30dSnapshots';

export function useNlpState() {
  const { earliestSnapshot, latestSnapshot } = useNlp30dSnapshots();

  return useMemo(() => {
    const apr = (() => {
      if (!latestSnapshot || !earliestSnapshot) {
        return undefined;
      }

      const monthlyChangeFrac = safeDiv(
        latestSnapshot.oraclePrice,
        earliestSnapshot.oraclePrice,
      );

      // Calculate Annual Percentage Rate (APR) using compound interest formula: APR = (1 + r)^12 - 1
      // where r is the monthly return (monthlyChangeFrac) and 12 is months per year
      // Using JS numbers for performance as BigNumber.pow() is computationally expensive
      return toBigNumber(monthlyChangeFrac.toNumber() ** 12 - 1);
    })();

    return {
      apr,
      tvlUsd: removeDecimals(latestSnapshot?.tvl),
      cumulativePnlUsd: removeDecimals(latestSnapshot?.cumulativePnl),
    };
  }, [earliestSnapshot, latestSnapshot]);
}
