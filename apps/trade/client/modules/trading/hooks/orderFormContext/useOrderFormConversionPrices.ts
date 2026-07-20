import { BalanceSide } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import { RoundPriceFn } from 'client/modules/trading/types/orderFormTypes';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { getOrderSlippageMultiplier } from 'client/modules/trading/utils/getOrderSlippageMultiplier';
import {
  getScaledOrderHealthStressPrice,
  getScaledOrderWorstFillPrice,
} from 'client/modules/trading/utils/scaledOrderUtils';
import { useMemo } from 'react';

interface Params {
  orderType: PlaceOrderType;
  firstExecutionPrice: BigNumber | undefined;
  topOfBookPrice: BigNumber | undefined;
  validatedLimitPriceInput: BigNumber | undefined;
  validatedTriggerPriceInput: BigNumber | undefined;
  validatedScaledOrderStartPriceInput: BigNumber | undefined;
  validatedScaledOrderEndPriceInput: BigNumber | undefined;
  orderSide: BalanceSide;
  roundPrice: RoundPriceFn;
}

export function useOrderFormConversionPrices({
  orderType,
  firstExecutionPrice,
  topOfBookPrice,
  validatedLimitPriceInput,
  validatedTriggerPriceInput,
  validatedScaledOrderStartPriceInput,
  validatedScaledOrderEndPriceInput,
  orderSide,
  roundPrice,
}: Params) {
  const {
    savedSettings: {
      market: marketSlippageFraction,
      stopMarket: stopMarketSlippageFraction,
    },
  } = useOrderSlippageSettings();
  const maxSlippageFraction = (() => {
    switch (orderType) {
      case 'market':
      case 'twap':
        return marketSlippageFraction;
      case 'stop_market':
        return stopMarketSlippageFraction;
      case 'stop_limit':
      case 'limit':
      case 'multi_limit':
        // Limit / Stop Limit / Multi Limit - not relevant as slippageFraction shouldn't be used
        return 0;
    }
  })();

  const inputConversionPrice = useMemo(() => {
    switch (orderType) {
      case 'market':
      case 'twap':
        return firstExecutionPrice;
      case 'multi_limit':
        // Scaled orders: use worst-fill price (not health-stress) so size estimates stay conservative.
        return getScaledOrderWorstFillPrice(
          validatedScaledOrderStartPriceInput,
          validatedScaledOrderEndPriceInput,
          orderSide,
        );
      case 'stop_market':
        return validatedTriggerPriceInput;
      case 'stop_limit':
      case 'limit':
        return validatedLimitPriceInput;
    }
  }, [
    orderType,
    firstExecutionPrice,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
    orderSide,
    validatedTriggerPriceInput,
    validatedLimitPriceInput,
  ]);

  const executionConversionPrice = useMemo(() => {
    const isLong = orderSide === 'long';

    const slippageMultiplier = getOrderSlippageMultiplier(
      isLong,
      maxSlippageFraction,
    );

    switch (orderType) {
      // Limit orders, use user entry
      case 'limit':
      // Stop limit orders use the limit price without slippage
      case 'stop_limit':
        return validatedLimitPriceInput;
      case 'multi_limit':
        // Scaled orders - use the health-stress price for max-size sizing.
        return getScaledOrderHealthStressPrice({
          startPrice: validatedScaledOrderStartPriceInput,
          endPrice: validatedScaledOrderEndPriceInput,
          orderSide,
        });
      case 'market':
      case 'twap': {
        if (topOfBookPrice == null) return;
        // Add slippage on the top of book price so that spread is included in the price with slippage
        return roundPrice(topOfBookPrice.multipliedBy(slippageMultiplier));
      }
      case 'stop_market': {
        // Stop market order - Add slippage on the trigger price
        if (validatedTriggerPriceInput == null) return;
        // Add slippage on the trigger price
        return roundPrice(
          validatedTriggerPriceInput.multipliedBy(slippageMultiplier),
        );
      }
    }
  }, [
    orderSide,
    maxSlippageFraction,
    orderType,
    validatedLimitPriceInput,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
    topOfBookPrice,
    roundPrice,
    validatedTriggerPriceInput,
  ]);

  // Conversion prices can change frequently, use a ref for certain usecases
  const inputConversionPriceRef = useSyncedRef(inputConversionPrice);
  const executionConversionPriceRef = useSyncedRef(executionConversionPrice);

  return {
    inputConversionPrice,
    inputConversionPriceRef,
    executionConversionPrice,
    executionConversionPriceRef,
    maxSlippageFraction,
  };
}
