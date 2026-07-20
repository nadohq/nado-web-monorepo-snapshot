import { getSafeIsoMaxLeverage } from '@nadohq/react-client';
import { PerpStaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { PerpPositionItem } from 'client/hooks/subaccount/usePerpPositions';
import { MarginMode } from 'client/modules/localstorage/userState/types/tradingSettings';
import {
  useOrderFormMaxOrderSizes,
  UseOrderFormMaxOrderSizesParams,
} from 'client/modules/trading/hooks/orderFormContext/useOrderFormMaxOrderSizes';
import { mapValues } from 'lodash';
import { useMemo } from 'react';

interface Params extends Omit<
  UseOrderFormMaxOrderSizesParams,
  'spotLeverageEnabled' | 'isoBorrowMargin'
> {
  marginMode: MarginMode;
  currentMarket: PerpStaticMarketData | undefined;
  currentPosition: PerpPositionItem | undefined;
  isReducingIsoPosition: boolean;
}

export function usePerpOrderFormMaxOrderSizes({
  orderType,
  inputConversionPrice,
  executionConversionPrice,
  validatedScaledOrderStartPriceInput,
  validatedScaledOrderEndPriceInput,
  orderSide,
  productId,
  roundAssetAmount,
  marginMode,
  currentMarket,
  reduceOnly,
}: Params) {
  const selectedLeverage = marginMode.leverage;
  // Iso: cap at getSafeIsoMaxLeverage to match calcIsoOrderRequiredMargin and avoid over-sizing.
  const maxOrderSizeLeverage = (() => {
    if (marginMode.mode !== 'isolated' || !currentMarket) {
      return selectedLeverage;
    }
    return Math.min(
      selectedLeverage,
      getSafeIsoMaxLeverage(currentMarket.maxLeverage),
    );
  })();

  const maxOrderSizes = useOrderFormMaxOrderSizes({
    orderType,
    inputConversionPrice,
    executionConversionPrice,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
    orderSide,
    productId,
    roundAssetAmount,
    reduceOnly,
    isoBorrowMargin: marginMode.enableBorrows,
  });

  return useMemo(() => {
    if (!maxOrderSizes || !currentMarket) {
      return;
    }
    // Leverage shouldn't affect reduce only orders
    if (reduceOnly) {
      return maxOrderSizes;
    }
    // Leverage ONLY impacts max order size, given by (true max order size) * leverage / max leverage
    // Isolated uses the same conservative leverage cap as margin transfer.
    return mapValues(maxOrderSizes, (val) =>
      val
        .multipliedBy(maxOrderSizeLeverage)
        .dividedBy(currentMarket.maxLeverage),
    );
  }, [maxOrderSizes, currentMarket, reduceOnly, maxOrderSizeLeverage]);
}
