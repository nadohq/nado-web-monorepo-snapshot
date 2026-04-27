import { useQuerySubaccountOpenEngineOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenEngineOrders';
import { useQuerySubaccountOpenTriggerOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { useSpreadBalances } from 'client/hooks/subaccount/useSpreadBalances';
import { ORDER_DISPLAY_TYPES } from 'client/modules/trading/consts/orderDisplayTypes';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { includes, sum, sumBy } from 'lodash';
import { useMemo } from 'react';

interface UseSubaccountCountIndicators {
  numPerpPositions: number;
  numCrossPerpPositions: number;
  numIsoPerpPositions: number;
  numLongPerpPositions: number;
  numShortPerpPositions: number;
  numOpenEngineOrders: number;
  numOpenPriceTriggerOrders: number;
  numOpenTimeTriggerOrders: number;
  numStopOrders: number;
  numTpslOrders: number;
  numOpenOrders: number;
  numSpreads: number;
}

export type SubaccountCountIndicatorKey = keyof UseSubaccountCountIndicators;

export function useSubaccountCountIndicators(): UseSubaccountCountIndicators {
  const { data: perpPositions } = usePerpPositions();
  const { data: spreadBalances } = useSpreadBalances();
  const { data: openEngineOrders } = useQuerySubaccountOpenEngineOrders();
  const { data: openTriggerOrders } = useQuerySubaccountOpenTriggerOrders();

  const {
    numCrossPerpPositions,
    numIsoPerpPositions,
    numPerpPositions,
    numLongPerpPositions,
    numShortPerpPositions,
  } = useMemo(() => {
    let numCross = 0;
    let numIso = 0;
    let numLong = 0;
    let numShort = 0;

    perpPositions?.forEach((position) => {
      if (position.amount.isZero()) {
        return;
      }
      if (position.amount.isPositive()) {
        numLong++;
      } else {
        numShort++;
      }

      if (position.iso) {
        numIso++;
      } else {
        numCross++;
      }
    });

    return {
      numCrossPerpPositions: numCross,
      numIsoPerpPositions: numIso,
      numLongPerpPositions: numLong,
      numShortPerpPositions: numShort,
      numPerpPositions: numCross + numIso,
    };
  }, [perpPositions]);

  const numOpenEngineOrders = useMemo(() => {
    return sumBy(
      Object.values(openEngineOrders ?? {}),
      (ordersForProduct) => ordersForProduct.length,
    );
  }, [openEngineOrders]);

  const {
    numOpenPriceTriggerOrders,
    numOpenTimeTriggerOrders,
    numStopOrders,
    numTpslOrders,
  } = useMemo(() => {
    let numOpenPriceTriggerOrders = 0;
    let numOpenTimeTriggerOrders = 0;
    let numStopOrders = 0;
    let numTpslOrders = 0;

    Object.values(openTriggerOrders ?? {}).forEach((ordersForProduct) => {
      ordersForProduct.forEach((order) => {
        const orderDisplayType = getTriggerOrderDisplayType(order);

        if (includes(ORDER_DISPLAY_TYPES.stop, orderDisplayType)) {
          numStopOrders++;
          numOpenPriceTriggerOrders++;
        } else if (includes(ORDER_DISPLAY_TYPES.tpSl, orderDisplayType)) {
          numTpslOrders++;
          numOpenPriceTriggerOrders++;
        } else if (includes(ORDER_DISPLAY_TYPES.twap, orderDisplayType)) {
          numOpenTimeTriggerOrders++;
        }
      });
    });

    return {
      numOpenPriceTriggerOrders,
      numOpenTimeTriggerOrders,
      numStopOrders,
      numTpslOrders,
    };
  }, [openTriggerOrders]);

  const numOpenOrders = sum([
    numOpenEngineOrders,
    numOpenPriceTriggerOrders,
    numOpenTimeTriggerOrders,
  ]);

  const numSpreads = spreadBalances?.length ?? 0;

  return {
    numCrossPerpPositions,
    numIsoPerpPositions,
    numPerpPositions,
    numOpenEngineOrders,
    numOpenTimeTriggerOrders,
    numOpenPriceTriggerOrders,
    numStopOrders,
    numTpslOrders,
    numOpenOrders,
    numLongPerpPositions,
    numShortPerpPositions,
    numSpreads,
  };
}
