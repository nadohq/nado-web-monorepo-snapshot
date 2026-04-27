import { addDecimals, BigNumbers } from '@nadohq/client';
import { useExecutePlaceOrder } from 'client/hooks/execute/placeOrder/useExecutePlaceOrder';
import { getMarketOrderExecutionPrice } from 'client/hooks/execute/util/getMarketOrderExecutionPrice';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { roundToIncrement } from 'client/utils/rounding';
import { FormEventHandler, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface UseReversePositionDialogParams {
  productId: number;
  isIso: boolean;
}

export function useReversePositionDialog({
  productId,
  isIso,
}: UseReversePositionDialogParams) {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const { dispatchNotification } = useNotificationManagerContext();
  const { data: perpPositions } = usePerpPositions();
  const { data: latestMarketPrices } = useQueryAllMarketsLatestPrices();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const {
    savedSettings: { market: maxSlippageFraction },
  } = useOrderSlippageSettings();
  const {
    mutateAsync: placeOrder,
    isPending,
    isSuccess,
  } = useExecutePlaceOrder();

  useRunWithDelayOnCondition({
    condition: isSuccess,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
    fn: () => {
      hide();
    },
  });

  const position = useMemo(() => {
    return perpPositions?.find((pos) => {
      const matchesProductId = pos.productId === productId;
      const matchesMarginMode = isIso ? !!pos.iso : !pos.iso;
      return matchesMarginMode && matchesProductId;
    });
  }, [perpPositions, productId, isIso]);

  const positionAmount = position?.amount ?? BigNumbers.ZERO;
  const isCurrentlyLong = positionAmount.gt(0);
  // To reverse, we need to trade double the current position size in the opposite direction
  const orderAmount = positionAmount.times(2).negated();

  const marketStaticData = allMarketsStaticData?.allMarkets[productId];
  const priceIncrement = marketStaticData?.priceIncrement;
  const sizeIncrement = marketStaticData?.sizeIncrement;

  const latestMarketPricesForProduct = latestMarketPrices?.[productId];
  const midPrice = latestMarketPricesForProduct?.safeMidPrice;

  // Calculate execution price with slippage for the actual order
  const marketOrderExecutionPrice = getMarketOrderExecutionPrice({
    isSell: isCurrentlyLong,
    latestMarketPrices: latestMarketPricesForProduct,
    marketSlippageFraction: maxSlippageFraction,
  });

  const buttonState: BaseActionButtonState = useMemo(() => {
    if (isSuccess) {
      return 'success';
    }
    if (isPending) {
      return 'loading';
    }
    if (!marketOrderExecutionPrice || !position) {
      return 'disabled';
    }
    return 'idle';
  }, [isPending, isSuccess, marketOrderExecutionPrice, position]);

  const handleSubmit = useCallback<FormEventHandler>(
    (e) => {
      // Prevent form submission from refreshing the page
      e.preventDefault();

      if (!position || !marketOrderExecutionPrice) {
        return;
      }

      const serverExecutionResult = placeOrder({
        productId,
        orderType: 'market',
        price: roundToIncrement(marketOrderExecutionPrice, priceIncrement),
        // No need to round here because the position must be in terms of the size increment
        amount: addDecimals(orderAmount),
        reduceOnly: false,
        // We assume no iso transfer is needed, as calculating margin requirement differences can be complex
        iso: position.iso
          ? {
              borrowMargin: false,
              margin: 0,
            }
          : undefined,
      });

      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: t(($) => $.errors.reversePositionFailed),
          executionData: { serverExecutionResult },
        },
      });
    },
    [
      position,
      marketOrderExecutionPrice,
      placeOrder,
      productId,
      orderAmount,
      priceIncrement,
      dispatchNotification,
      t,
    ],
  );

  return {
    position,
    isCurrentlyLong,
    orderAmount,
    midPrice,
    maxSlippageFraction,
    priceIncrement,
    sizeIncrement,
    buttonState,
    isPending,
    handleSubmit,
    hide,
  };
}
