import { toBigNumber, TriggerOrderInfo } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { useTpSlOrders } from 'client/hooks/subaccount/useTpSlOrders';
import { PerpPositionsTableItem } from 'client/modules/tables/types/PerpPositionsTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { getPriceTriggerCriteria } from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';
import { createRowId } from 'client/utils/createRowId';
import { useMemo } from 'react';

interface Params {
  productIds?: number[];
}

export function usePerpPositionsTable({ productIds }: Params) {
  const { data: tpSlOrdersData } = useTpSlOrders();
  const { data: perpBalances, isLoading } = usePerpPositions();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const mappedData: PerpPositionsTableItem[] | undefined = useMemo(() => {
    if (!perpBalances || !allMarketsStaticData) {
      return;
    }
    return perpBalances
      .filter(
        (balance) =>
          !balance.amount.isZero() &&
          (!productIds || productIds.includes(balance.productId)),
      )
      .map((position): PerpPositionsTableItem => {
        const allTpSlOrdersForProduct = tpSlOrdersData?.[position.productId];
        const tpSlOrders = !!position.iso
          ? allTpSlOrdersForProduct?.iso
          : allTpSlOrdersForProduct?.cross;
        const tpTriggerPrice = getTpSlTriggerPrice(tpSlOrders?.tp);
        const slTriggerPrice = getTpSlTriggerPrice(tpSlOrders?.sl);
        const hasMultipleTpOrSlOrders = (() => {
          if (!tpSlOrders) {
            return false;
          }
          return tpSlOrders.allTp.length > 1 || tpSlOrders.allSl.length > 1;
        })();

        const productTableItem = getProductTableItem({
          productId: position.productId,
          allMarketsStaticData,
        });

        return {
          ...productTableItem,
          rowId: createRowId(
            position.productId,
            position.iso?.subaccountName ?? 'cross',
          ),
          isoSubaccountName: position.iso?.subaccountName,
          positionAmount: position.amount,
          positionSize: position.amount.abs(),
          notionalValueUsd: position.notionalValueUsd,
          pnlInfo: {
            estimatedPnlUsd: position.estimatedPnlUsd,
            estimatedPnlFrac: position.estimatedPnlFrac,
          },
          tpSl: {
            tpTriggerPrice,
            slTriggerPrice,
            allOrders: tpSlOrders?.all,
            hasMultipleTpOrSlOrders,
          },
          averageEntryPrice: position.price.averageEntryPrice,
          oraclePrice: position.price.fastOraclePrice,
          estimatedExitPrice: position.price.estimatedExitPrice,
          netFunding: position.netFunding,
          estimatedLiquidationPrice: position.estimatedLiquidationPrice,
          margin: {
            crossMarginUsedUsd: position.crossMarginUsedUsd,
            isoLeverage: position.iso ? position.iso.leverage : null,
            isoMarginUsedUsd: position.iso?.netMargin,
            marginModeType: !!position.iso ? 'isolated' : 'cross',
          },
        };
      });
  }, [productIds, perpBalances, tpSlOrdersData, allMarketsStaticData]);

  return {
    positions: mappedData,
    isLoading,
  };
}

function getTpSlTriggerPrice(
  triggerOrder: TriggerOrderInfo | undefined,
): BigNumber | undefined {
  if (!triggerOrder) {
    return;
  }
  const priceTriggerCriteria = getPriceTriggerCriteria(
    triggerOrder.order.triggerCriteria,
  );
  if (!priceTriggerCriteria) {
    return;
  }

  return toBigNumber(priceTriggerCriteria.triggerPrice);
}
