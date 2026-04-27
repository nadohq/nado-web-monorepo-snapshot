import { removeDecimals, sumBigNumberBy } from '@nadohq/client';
import {
  calcIsoPositionNetMargin,
  calcTotalPortfolioValues,
  SubaccountProfile,
  useSubaccountContext,
  useSubaccountNames,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useQueryIsolatedPositionsForAppSubaccounts } from 'client/hooks/query/subaccount/isolatedPositions/useQueryIsolatedPositionsForAppSubaccounts';
import { useQuerySummariesForAppSubaccounts } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySummariesForAppSubaccounts';
import { useMemo } from 'react';

export interface SubaccountWithMetrics {
  subaccountName: string;
  profile: SubaccountProfile;
  portfolioValueUsd: BigNumber | undefined;
}

/**
 * Returns the name, profile, and portfolio value (USD) for all subaccounts, including API subaccounts.
 * Portfolio values are not fetched for API subaccounts via `useAppSubaccountSummaries`
 */
export function useAllSubaccountsWithMetrics(): SubaccountWithMetrics[] {
  const { getSubaccountProfile } = useSubaccountContext();
  // Use the subaccount names hook directly so that we can access the API subaccount names
  const subaccountNames = useSubaccountNames();
  const { data: summariesForAppSubaccounts } =
    useQuerySummariesForAppSubaccounts();
  const { data: isoPositionsForAppSubaccounts } =
    useQueryIsolatedPositionsForAppSubaccounts();

  return useMemo(() => {
    return subaccountNames.all.map((subaccountName) => {
      const summary = summariesForAppSubaccounts?.[subaccountName];
      const isolatedPositions = isoPositionsForAppSubaccounts?.[subaccountName];

      const portfolioValueUsd = (() => {
        // Return `undefined` if we don't have summaries so we can show placeholders (e.g. `-`).
        if (!summary || !isolatedPositions) {
          return;
        }

        const totalCrossPortfolioValues = calcTotalPortfolioValues(summary);
        const totalIsolatedNetMargin = sumBigNumberBy(
          isolatedPositions,
          (position) => {
            return calcIsoPositionNetMargin(
              position.baseBalance,
              position.quoteBalance,
            );
          },
        );

        return removeDecimals(
          totalCrossPortfolioValues.netTotal.plus(totalIsolatedNetMargin),
        );
      })();

      return {
        subaccountName,
        profile: getSubaccountProfile(subaccountName),
        portfolioValueUsd,
      };
    });
  }, [
    subaccountNames.all,
    summariesForAppSubaccounts,
    isoPositionsForAppSubaccounts,
    getSubaccountProfile,
  ]);
}
