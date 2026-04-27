import { addDecimals, ProductEngineType, toBigNumber } from '@nadohq/client';
import { AnnotatedSpotMarket } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { ExecutePlaceEngineOrderParams } from 'client/hooks/execute/placeOrder/types';
import { useExecutePlaceOrder } from 'client/hooks/execute/placeOrder/useExecutePlaceOrder';
import {
  RepayConvertFormValues,
  RepayConvertProductSelectValue,
} from 'client/modules/collateral/repay/hooks/useRepayConvertForm/types';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Params {
  form: UseFormReturn<RepayConvertFormValues>;
  executePlaceOrder: ReturnType<typeof useExecutePlaceOrder>;
  marketProduct: RepayConvertProductSelectValue | undefined;
  market: AnnotatedSpotMarket | undefined;
  executionConversionPrice: BigNumber | undefined;
  isSellOrder: boolean;
}

export function useRepayConvertSubmitHandler({
  form,
  executePlaceOrder,
  marketProduct,
  market,
  executionConversionPrice,
  isSellOrder,
}: Params) {
  const { dispatchNotification } = useNotificationManagerContext();

  return useCallback(
    (data: RepayConvertFormValues) => {
      if (!marketProduct || !executionConversionPrice) {
        return;
      }
      const repayAmount = toBigNumber(data.repayAmount);
      // If selling (repaying USDT), order is in terms of source
      const orderAmount = isSellOrder
        ? repayAmount.div(executionConversionPrice).negated()
        : repayAmount;
      const decimalAdjustedAmount = addDecimals(orderAmount);

      const mutationParams: ExecutePlaceEngineOrderParams = {
        productId: marketProduct.productId,
        price: executionConversionPrice,
        amount: decimalAdjustedAmount,
        orderType: 'market',
        spotLeverage: false,
      };
      const executeResult = executePlaceOrder.mutateAsync(mutationParams, {
        onSuccess: () => {
          form.resetField('repayAmount');
          form.setValue('sourceProductId', undefined);
        },
      });

      dispatchNotification({
        type: 'place_order',
        data: {
          placeOrderParams: mutationParams,
          orderMarketType: ProductEngineType.SPOT,
          orderType: 'market',
          executeResult,
          metadata: {
            marketName: marketProduct.marketName,
            symbol: marketProduct.symbol,
            icon: marketProduct.icon,
            priceIncrement: market?.priceIncrement,
            sizeIncrement: market?.sizeIncrement,
          },
        },
      });
    },
    [
      marketProduct,
      executionConversionPrice,
      isSellOrder,
      executePlaceOrder,
      dispatchNotification,
      market?.priceIncrement,
      market?.sizeIncrement,
      form,
    ],
  );
}
