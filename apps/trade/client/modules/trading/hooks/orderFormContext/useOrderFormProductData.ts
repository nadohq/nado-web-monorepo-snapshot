import { removeDecimals } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { LatestMarketPrice } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { OrderFormValues } from 'client/modules/trading/types/orderFormTypes';
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
      return roundToIncrement(price, priceIncrement);
    },
    [priceIncrement],
  );

  const roundAssetAmount = useCallback(
    (size: BigNumber) => {
      return roundToIncrement(
        size,
        decimalAdjustedSizeIncrement,
        BigNumber.ROUND_DOWN,
      );
    },
    [decimalAdjustedSizeIncrement],
  );

  const { firstExecutionPrice, topOfBookPrice } = useMemo(() => {
    if (latestMarketPrices == null) {
      return {};
    }
    const firstExecutionPrice =
      orderSide === 'long'
        ? latestMarketPrices.safeAsk
        : latestMarketPrices.safeBid;
    const topOfBookPrice =
      orderSide === 'long'
        ? latestMarketPrices.safeBid
        : latestMarketPrices.safeAsk;

    return {
      firstExecutionPrice: firstExecutionPrice
        ? roundPrice(firstExecutionPrice)
        : undefined,
      topOfBookPrice: topOfBookPrice ? roundPrice(topOfBookPrice) : undefined,
    };
  }, [latestMarketPrices, orderSide, roundPrice]);

  const minAssetOrderSize = useMemo(() => {
    if (!decimalAdjustedMinSize) {
      return;
    }

    switch (orderType) {
      case 'market':
      case 'twap':
      case 'stop_market':
        return decimalAdjustedSizeIncrement;
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
          decimalAdjustedSizeIncrement,
          BigNumber.ROUND_UP,
        );
      }
      case 'limit':
      case 'stop_limit': {
        return validatedLimitPriceInput
          ? roundToIncrement(
              decimalAdjustedMinSize.div(validatedLimitPriceInput),
              decimalAdjustedSizeIncrement,
              BigNumber.ROUND_UP,
            )
          : undefined;
      }
    }
  }, [
    decimalAdjustedMinSize,
    orderType,
    decimalAdjustedSizeIncrement,
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
    roundPrice,
    roundAssetAmount,
  };
}
