import { BigNumbers } from '@nadohq/client';
import { SpotProductMetadata } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { usePrimaryQuoteBalance } from 'client/hooks/subaccount/usePrimaryQuoteBalance';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { MarginWeightMetrics } from 'client/pages/Portfolio/subpages/MarginManager/types';
import { useMemo } from 'react';

export interface MarginManagerQuoteBalanceTableItem extends WithDataTableRowId {
  productId: number;
  metadata: SpotProductMetadata;
  unsettledQuoteUsd: BigNumber;
  netBalanceUsd: BigNumber;
  balanceAmount: BigNumber;
  initialHealth: MarginWeightMetrics;
  maintenanceHealth: MarginWeightMetrics;
}

export function useMarginManagerQuoteBalanceTable() {
  const { data: derivedOverview, isLoading: isDerivedOverviewLoading } =
    useSubaccountOverview();
  const { data: primaryQuoteBalance, isLoading: isPrimaryQuoteBalanceLoading } =
    usePrimaryQuoteBalance();

  const mappedData: MarginManagerQuoteBalanceTableItem[] | undefined =
    useMemo(() => {
      if (!primaryQuoteBalance || !derivedOverview) {
        return;
      }

      const quoteTableItem = (() => {
        const unsettledQuoteUsd =
          derivedOverview.perp.cross.totalUnsettledQuote;

        const netBalanceUsd = unsettledQuoteUsd.plus(
          primaryQuoteBalance.amount,
        );

        // return net balance is zero and cash balance is zero.
        if (
          netBalanceUsd.eq(BigNumbers.ZERO) &&
          primaryQuoteBalance.amount.eq(BigNumbers.ZERO)
        ) {
          return;
        }

        return {
          productId: primaryQuoteBalance.productId,
          metadata: primaryQuoteBalance.metadata,
          balanceAmount: primaryQuoteBalance.amount,
          unsettledQuoteUsd,
          netBalanceUsd,
          initialHealth: {
            marginUsd: netBalanceUsd,
            weight: BigNumbers.ONE,
          },
          maintenanceHealth: {
            marginUsd: netBalanceUsd,
            weight: BigNumbers.ONE,
          },
          rowId: String(primaryQuoteBalance.productId),
        };
      })();

      return quoteTableItem ? [quoteTableItem] : undefined;
    }, [derivedOverview, primaryQuoteBalance]);

  return {
    balances: mappedData,
    isLoading: isDerivedOverviewLoading || isPrimaryQuoteBalanceLoading,
  };
}
