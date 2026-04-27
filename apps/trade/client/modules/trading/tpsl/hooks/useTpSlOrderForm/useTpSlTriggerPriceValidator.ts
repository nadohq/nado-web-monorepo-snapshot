import { BalanceSide } from '@nadohq/client';
import { InputValidatorFn, safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { TpSlOrderFormTriggerPriceErrorType } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { useCallback } from 'react';

interface Params {
  positionSide: BalanceSide | undefined;
  isTakeProfit: boolean;
  referencePrice: BigNumber | undefined;
}

export function useTpSlTriggerPriceValidator({
  positionSide,
  isTakeProfit,
  referencePrice,
}: Params) {
  return useCallback<
    InputValidatorFn<string, TpSlOrderFormTriggerPriceErrorType>
  >(
    (triggerPrice) => {
      if (!triggerPrice) {
        return;
      }

      const parsedTriggerPrice = safeParseForData(
        positiveBigNumberValidator,
        triggerPrice,
      );

      if (!parsedTriggerPrice) {
        return 'invalid_trigger_price_input';
      }

      if (!positionSide || referencePrice == null) {
        return;
      }

      /*
       * Validate Trigger Price:
       * If Long position
       *  Take Profit = Trigger Price > Reference Price
       *  Stop Loss = Trigger Price < Reference Price
       *
       * If Short position
       *  Take Profit = Trigger Price < Reference Price
       *  Stop Loss = Trigger Price > Reference Price
       */
      if (positionSide === 'long') {
        if (isTakeProfit) {
          if (parsedTriggerPrice.lte(referencePrice)) {
            return 'trigger_price_must_be_above_price';
          }
        } else {
          if (parsedTriggerPrice.gte(referencePrice)) {
            return 'trigger_price_must_be_below_price';
          }
        }
      } else {
        if (isTakeProfit) {
          if (parsedTriggerPrice.gte(referencePrice)) {
            return 'trigger_price_must_be_below_price';
          }
        } else {
          if (parsedTriggerPrice.lte(referencePrice)) {
            return 'trigger_price_must_be_above_price';
          }
        }
      }
    },
    [isTakeProfit, referencePrice, positionSide],
  );
}
