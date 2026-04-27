import { QUOTE_PRODUCT_ID, removeDecimals } from '@nadohq/client';
import { AnnotatedSpotMarket } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useMarket } from 'client/hooks/markets/useMarket';
import { RepayConvertProductSelectValue } from 'client/modules/collateral/repay/hooks/useRepayConvertForm/types';
import { roundToIncrement } from 'client/utils/rounding';
import { useCallback } from 'react';

interface Params {
  /** The selected source product */
  selectedSourceProduct: RepayConvertProductSelectValue | undefined;
  /** The selected repay product */
  selectedRepayProduct: RepayConvertProductSelectValue | undefined;
}

/**
 * The market product is the product, either repay or source, with an associated market
 * @param params Configuration object
 * @returns Market data for the repay conversion
 */
export function useRepayConvertMarketData({
  selectedRepayProduct,
  selectedSourceProduct,
}: Params) {
  // If the repay product is quote, then the market product is the source product
  // If the repay product is NOT quote, then this is the market asset
  const { marketProduct, isSellOrder } = (() => {
    const isSellOrder = selectedRepayProduct?.productId === QUOTE_PRODUCT_ID;

    if (!selectedRepayProduct || !selectedSourceProduct) {
      return {
        isSellOrder,
        marketProduct: undefined,
      };
    }

    return {
      isSellOrder,
      marketProduct: isSellOrder ? selectedSourceProduct : selectedRepayProduct,
    };
  })();

  const { data: market } = useMarket<AnnotatedSpotMarket>({
    productId: marketProduct?.productId,
  });

  const sizeIncrement = removeDecimals(market?.sizeIncrement);

  const roundAmount = useCallback(
    (size: BigNumber, roundingMode?: BigNumber.RoundingMode) => {
      return roundToIncrement(
        size,
        sizeIncrement,
        roundingMode ?? BigNumber.ROUND_DOWN,
      );
    },
    [sizeIncrement],
  );

  return {
    marketProduct,
    market,
    isSellOrder,
    sizeIncrement,
    roundAmount,
  };
}
