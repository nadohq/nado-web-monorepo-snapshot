import { removeDecimals } from '@nadohq/client';
import {
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { LatestMarketPrice } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { OrderFormValues } from 'client/modules/trading/types/orderFormTypes';
import { useGetIsXStocksProduct } from 'client/modules/xStocks/hooks/useGetIsXStocksProduct';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { roundToIncrement } from 'client/utils/rounding';
import { useCallback, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Params {
  form: UseFormReturn<OrderFormValues>;
  currentMarket: StaticMarketData | undefined;
  latestMarketPrices: LatestMarketPrice | undefined;
  validatedLimitPriceInput: BigNumber | undefined;
  validatedScaledOrderStartPriceInput: BigNumber | undefined;
  validatedScaledOrderEndPriceInput: BigNumber | undefined;
}

export function useOrderFormProductData({
  form,
  currentMarket,
  latestMarketPrices,
  validatedLimitPriceInput,
  validatedScaledOrderStartPriceInput,
  validatedScaledOrderEndPriceInput,
}: Params) {
  const [orderSide, orderType] = useWatch({
    control: form.control,
    name: ['side', 'orderType'],
  });

  const { getExchangeRate } = useGetXStocksExchangeRate();
  const exchangeRate = useMemo(
    () => getExchangeRate(currentMarket?.productId),
    [getExchangeRate, currentMarket?.productId],
  );

  const getIsXStocksProduct = useGetIsXStocksProduct();
  // xStocks markets use display-space values in the form; all rounding/validation
  // against raw increments is skipped here and handled in usePlaceOrderMutationFn.
  const isXStocksMarket = getIsXStocksProduct(currentMarket?.productId);

  const {
    decimalAdjustedMinSize,
    decimalAdjustedSizeIncrement,
    priceIncrement,
  } = useMemo(() => {
    return {
      decimalAdjustedMinSize: removeDecimals(currentMarket?.minSize),
      decimalAdjustedSizeIncrement: removeDecimals(
        currentMarket?.sizeIncrement,
      ),
      priceIncrement: currentMarket?.priceIncrement,
    };
  }, [
    currentMarket?.minSize,
    currentMarket?.sizeIncrement,
    currentMarket?.priceIncrement,
  ]);

  const roundPrice = useCallback(
    (price: BigNumber) => {
      if (isXStocksMarket) {
        // Prevent super-precise numbers on the UI
        return price.sd(8, BigNumber.ROUND_DOWN);
      }
      return roundToIncrement(price, priceIncrement);
    },
    [priceIncrement, isXStocksMarket],
  );

  const roundAssetAmount = useCallback(
    (size: BigNumber) => {
      // Prevent super-precise numbers on the UI (ex. in the asset input when dragging the slider)
      if (isXStocksMarket) {
        return size.sd(8, BigNumber.ROUND_DOWN);
      }
      return roundToIncrement(
        size,
        decimalAdjustedSizeIncrement,
        BigNumber.ROUND_DOWN,
      );
    },
    [decimalAdjustedSizeIncrement, isXStocksMarket],
  );

  const { firstExecutionPrice, topOfBookPrice } = useMemo(() => {
    if (latestMarketPrices == null) {
      return {};
    }
    // Oracle prices from the backend are in raw (wQQQx) space — convert to display before use in form context
    const rawFirstExecutionPrice =
      orderSide === 'long'
        ? latestMarketPrices.safeAsk
        : latestMarketPrices.safeBid;
    const rawTopOfBookPrice =
      orderSide === 'long'
        ? latestMarketPrices.safeBid
        : latestMarketPrices.safeAsk;

    const displayFirstExecutionPrice = toXStocksDisplayPrice(
      rawFirstExecutionPrice,
      exchangeRate,
    );
    const displayTopOfBookPrice = toXStocksDisplayPrice(
      rawTopOfBookPrice,
      exchangeRate,
    );

    return {
      firstExecutionPrice: displayFirstExecutionPrice
        ? roundPrice(displayFirstExecutionPrice)
        : undefined,
      topOfBookPrice: displayTopOfBookPrice
        ? roundPrice(displayTopOfBookPrice)
        : undefined,
    };
  }, [latestMarketPrices, orderSide, exchangeRate, roundPrice]);

  const minAssetOrderSize = useMemo(() => {
    if (!decimalAdjustedMinSize) {
      return;
    }

    const displaySizeIncrement = toXStocksDisplayAmount(
      decimalAdjustedSizeIncrement,
      exchangeRate,
    );

    switch (orderType) {
      case 'market':
      case 'twap':
      case 'stop_market':
        return displaySizeIncrement;
      case 'multi_limit': {
        // For minimum notional validation, we must ensure EVERY suborder meets the requirement.
        // The smallest suborder (by asset amount) can be paired with ANY price in the range,
        // depending on the size/price distribution combination.
        //
        // To guarantee all suborders meet minimum notional (amount × price >= minNotional):
        // - Use the LOWEST price in the range (most conservative)
        // - This ensures: smallestAmount × lowestPrice >= minNotional
        // - At any higher price, the notional will be even larger
        //
        // This is conservative - some valid orders may be rejected when the smallest suborder
        // would actually execute at a higher price, but no invalid orders will pass through.
        //
        // Note: decimalAdjustedMinSize is in USDT0 (notional), lowestPrice is in display space.
        // dividing notional by displayPrice gives the correct display asset size:
        // notional / displayPrice = notional / (rawPrice / R) = notional * R / rawPrice = displayAmount
        if (
          !validatedScaledOrderStartPriceInput ||
          !validatedScaledOrderEndPriceInput
        ) {
          return;
        }

        const lowestPrice = BigNumber.min(
          validatedScaledOrderStartPriceInput,
          validatedScaledOrderEndPriceInput,
        );

        return roundToIncrement(
          decimalAdjustedMinSize.div(lowestPrice),
          displaySizeIncrement,
          BigNumber.ROUND_UP,
        );
      }
      case 'limit':
      case 'stop_limit': {
        return validatedLimitPriceInput
          ? roundToIncrement(
              decimalAdjustedMinSize.div(validatedLimitPriceInput),
              displaySizeIncrement,
              BigNumber.ROUND_UP,
            )
          : undefined;
      }
    }
  }, [
    decimalAdjustedMinSize,
    decimalAdjustedSizeIncrement,
    exchangeRate,
    orderType,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
    validatedLimitPriceInput,
  ]);

  return {
    // Price of the first book offer that will be hit by the order, if this is a buy, then this is the lowest ask
    firstExecutionPrice,
    // Price of the top of the relevant side of book, if this is a buy, then this is the highest bid
    topOfBookPrice,
    priceIncrement,
    decimalAdjustedSizeIncrement,
    minAssetOrderSize,
    isXStocksMarket,
    roundPrice,
    roundAssetAmount,
  };
}
