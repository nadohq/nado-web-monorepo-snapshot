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
  'spotLeverageEnabled' | 'disabled'
> {
  marginMode: MarginMode;
  currentMarket: PerpStaticMarketData | undefined;
  currentPosition: PerpPositionItem | undefined;
  isReducingIsoPosition: boolean;
}

export function usePerpOrderFormMaxOrderSizes({
  executionConversionPrice,
  inputConversionPrice,
  orderSide,
  productId,
  roundAssetAmount,
  marginMode,
  currentMarket,
  reduceOnly,
}: Params) {
  const selectedLeverage = marginMode.leverage;

  const maxOrderSizes = useOrderFormMaxOrderSizes({
    inputConversionPrice,
    executionConversionPrice,
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
    return mapValues(maxOrderSizes, (val) =>
      val.multipliedBy(selectedLeverage).dividedBy(currentMarket.maxLeverage),
    );
  }, [maxOrderSizes, currentMarket, reduceOnly, selectedLeverage]);
}
