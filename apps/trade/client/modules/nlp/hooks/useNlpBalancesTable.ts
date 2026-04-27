import {
  NLP_PRODUCT_ID,
  ProductEngineType,
  QUOTE_PRODUCT_ID,
  removeDecimals,
} from '@nadohq/client';
import { calcPnl, calcPnlFrac } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { getStaticMarketDataForProductId } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/getStaticMarketDataForProductId';
import { useNlpAggregatedBalances } from 'client/modules/nlp/hooks/useNlpAggregatedBalances';
import { NlpBalancesTableItem } from 'client/modules/nlp/types/NlpBalancesTableItem';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { useMemo } from 'react';

export function useNlpBalancesTable() {
  const { data: marketStaticData } = useAllMarketsStaticData();
  const { data: nlpBalances, isLoading } = useNlpAggregatedBalances();

  const mappedData = useMemo(() => {
    if (!nlpBalances || !marketStaticData) {
      return undefined;
    }

    return nlpBalances
      .filter(
        ({ balance }) =>
          balance.type === ProductEngineType.SPOT &&
          // exclude NLP from table as pools' balance is always negative and PnL here
          // equals sum(spot pnl w/o nlp + perp pnl) which is not meaningful to show
          // together with other regular spot balances
          balance.productId !== NLP_PRODUCT_ID,
      )
      .map(
        ({ balance, balanceTrackedVars }): NlpBalancesTableItem | undefined => {
          const staticMarketData = getStaticMarketDataForProductId(
            balance.productId,
            marketStaticData,
          );

          if (!staticMarketData) {
            return undefined;
          }

          const decimalAdjustedBalanceAmount = removeDecimals(balance.amount);

          const pnlInfo = (() => {
            // primary quote product does not have meaningful uPnL
            if (balance.productId === QUOTE_PRODUCT_ID) {
              return;
            }

            const unrealizedPnl = calcPnl(
              balance.amount,
              balance.oraclePrice,
              balanceTrackedVars.netEntryUnrealized,
            );

            const unrealizedPnlFrac = calcPnlFrac(
              unrealizedPnl,
              balanceTrackedVars.netEntryUnrealized,
            );

            return {
              pnlUsd: removeDecimals(unrealizedPnl),
              pnlFrac: unrealizedPnlFrac,
            };
          })();

          return {
            rowId: String(balance.productId),
            metadata: getSharedProductMetadata(staticMarketData.metadata),
            amount: decimalAdjustedBalanceAmount,
            valueUsd: balance.oraclePrice.times(decimalAdjustedBalanceAmount),
            estimatedPnlUsd: pnlInfo?.pnlUsd,
            estimatedPnlFrac: pnlInfo?.pnlFrac,
          };
        },
      )
      .filter(nonNullFilter);
  }, [nlpBalances, marketStaticData]);

  return {
    balances: mappedData,
    isLoading,
  };
}
