import { ProductEngineType, removeDecimals } from '@nadohq/client';
import {
  calcPerpEntryCostBeforeLeverage,
  calcPnl,
  calcPnlFrac,
  safeDiv,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useNlpAggregatedBalances } from 'client/modules/nlp/hooks/useNlpAggregatedBalances';
import { NlpPositionsTableItem } from 'client/modules/nlp/types/NlpPositionsTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { getEstimatedExitPrice } from 'client/utils/getEstimatedExitPrice';
import { useMemo } from 'react';

export function useNlpPositionsTable() {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { data: latestMarketPrices } = useQueryAllMarketsLatestPrices();
  const { data: nlpBalances, isLoading } = useNlpAggregatedBalances();

  const mappedData = useMemo(() => {
    if (!nlpBalances || !allMarketsStaticData) {
      return undefined;
    }

    return nlpBalances
      .filter(
        (nlpBalance) =>
          nlpBalance.balance.type === ProductEngineType.PERP &&
          !nlpBalance.balance.amount.isZero(),
      )
      .map((position): NlpPositionsTableItem | undefined => {
        const productId = position.balance.productId;
        const productTableItem = getProductTableItem({
          productId,
          allMarketsStaticData,
        });

        if (!productTableItem) {
          return undefined;
        }

        const productLatestMarketPrices = latestMarketPrices?.[productId];

        const decimalAdjustedBalanceAmount = removeDecimals(
          position.balance.amount,
        );

        const averageEntryPrice = safeDiv(
          position.balanceTrackedVars.netEntryUnrealized,
          position.balance.amount,
        ).abs();

        const oraclePrice = position.balance.oraclePrice;

        const pnlInfo = (() => {
          const estimatedExitPrice =
            getEstimatedExitPrice(
              position.balance.amount.isPositive(),
              productLatestMarketPrices,
            ) ?? oraclePrice;

          const unrealizedPnl = calcPnl(
            position.balance.amount,
            estimatedExitPrice,
            position.balanceTrackedVars.netEntryUnrealized,
          );

          const unrealizedPnlFrac = calcPnlFrac(
            unrealizedPnl,
            calcPerpEntryCostBeforeLeverage(
              position.balance.longWeightInitial,
              position.balanceTrackedVars.netEntryUnrealized,
            ),
          );

          return {
            estimatedPnlUsd: removeDecimals(unrealizedPnl),
            estimatedPnlFrac: unrealizedPnlFrac,
          };
        })();

        const netFunding = removeDecimals(
          position.balanceTrackedVars.netFundingUnrealized,
        );

        return {
          ...productTableItem,
          rowId: String(productId),
          positionAmount: decimalAdjustedBalanceAmount,
          positionSize: decimalAdjustedBalanceAmount.abs(),
          notionalValueUsd: position.balance.oraclePrice.times(
            decimalAdjustedBalanceAmount,
          ),
          averageEntryPrice: averageEntryPrice,
          oraclePrice,
          pnlInfo,
          margin: {
            marginModeType: 'cross',
            crossMarginUsedUsd: undefined,
            isoMarginUsedUsd: undefined,
            isoLeverage: null,
          },
          netFunding,
        };
      })
      .filter(nonNullFilter);
  }, [nlpBalances, allMarketsStaticData, latestMarketPrices]);

  return {
    positions: mappedData,
    isLoading,
  };
}
