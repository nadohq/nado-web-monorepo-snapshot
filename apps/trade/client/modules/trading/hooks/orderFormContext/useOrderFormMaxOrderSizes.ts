import { BalanceSide } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { UseQueryMaxOrderSizeParams } from 'client/hooks/query/subaccount/useQueryMaxOrderSize';
import { useMaxOrderSizeEstimation } from 'client/hooks/subaccount/useMaxOrderSizeEstimation';
import { useDebounceFalsy } from 'client/hooks/util/useDebounceFalsy';
import { RoundAmountFn } from 'client/modules/trading/types/orderFormTypes';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { getScaledOrderAveragePrice } from 'client/modules/trading/utils/scaledOrderUtils';
import { useMemo } from 'react';

export interface UseOrderFormMaxOrderSizesParams {
  orderType: PlaceOrderType;
  inputConversionPrice: BigNumber | undefined;
  executionConversionPrice: BigNumber | undefined;
  validatedScaledOrderStartPriceInput: BigNumber | undefined;
  validatedScaledOrderEndPriceInput: BigNumber | undefined;
  orderSide: BalanceSide;
  productId: number | undefined;
  reduceOnly: boolean | undefined;
  roundAssetAmount: RoundAmountFn;
  spotLeverageEnabled?: boolean;
  // Not defined if not iso
  isoBorrowMargin?: boolean;
}

export interface OrderFormMaxOrderSizes {
  asset: BigNumber;
  quote: BigNumber;
}

export function useOrderFormMaxOrderSizes({
  orderType,
  inputConversionPrice,
  executionConversionPrice,
  validatedScaledOrderStartPriceInput,
  validatedScaledOrderEndPriceInput,
  orderSide,
  productId,
  spotLeverageEnabled,
  roundAssetAmount,
  reduceOnly,
  isoBorrowMargin,
}: UseOrderFormMaxOrderSizesParams) {
  const maxOrderSizeAvgPrice = useMemo(() => {
    if (orderType !== 'multi_limit') {
      return;
    }
    return getScaledOrderAveragePrice(
      validatedScaledOrderStartPriceInput,
      validatedScaledOrderEndPriceInput,
    );
  }, [
    orderType,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
  ]);

  const maxOrderSizeParams = useMemo(():
    | UseQueryMaxOrderSizeParams
    | undefined => {
    if (!executionConversionPrice || !productId) {
      return;
    }

    return {
      price: executionConversionPrice,
      avgPrice: maxOrderSizeAvgPrice,
      side: orderSide,
      productId: productId,
      spotLeverage: spotLeverageEnabled,
      reduceOnly,
      isolated: isoBorrowMargin != null,
      isoBorrowMargin,
    };
  }, [
    executionConversionPrice,
    isoBorrowMargin,
    maxOrderSizeAvgPrice,
    orderSide,
    productId,
    reduceOnly,
    spotLeverageEnabled,
  ]);

  const { data: maxAssetOrderSize } =
    useMaxOrderSizeEstimation(maxOrderSizeParams);

  const maxSizes = useMemo((): OrderFormMaxOrderSizes | undefined => {
    if (!maxAssetOrderSize || !inputConversionPrice) {
      return;
    }

    const roundedMaxAssetSize = roundAssetAmount(maxAssetOrderSize);

    const maxQuoteSize = roundedMaxAssetSize.times(inputConversionPrice);
    return {
      asset: roundedMaxAssetSize,
      quote: maxQuoteSize,
    };
  }, [maxAssetOrderSize, inputConversionPrice, roundAssetAmount]);

  // Debounce the data here to prevent UI flickers on price changes, which will result in a brief time during which the query data is undefined
  return useDebounceFalsy(maxSizes);
}
