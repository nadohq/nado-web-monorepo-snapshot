import { toBigNumber } from '@nadohq/client';
import { calcPnl, calcPnlFrac } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { getTpSlFormPriceValuesKey } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/getTpSlFormPriceValuesKey';
import {
  GainOrLossInputType,
  TpSlOrderFormValues,
  TriggerPriceSource,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { roundToIncrement, roundToString } from 'client/utils/rounding';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Params {
  form: UseFormReturn<TpSlOrderFormValues>;
  gainOrLossInputType: GainOrLossInputType;
  isTakeProfit: boolean;
  positionCloseAmount: BigNumber | undefined;
  positionCloseAmountNetEntry: BigNumber | undefined;
  positionCloseAmountNetCostForPnl: BigNumber | undefined;
  priceIncrement: BigNumber | undefined;
  triggerPriceSource: TriggerPriceSource;
  validGainOrLossValue: BigNumber | undefined;
  validTriggerPrice: BigNumber | undefined;
}

export function useTpSlOrderFormPriceOnChangeSideEffects({
  form,
  validGainOrLossValue,
  validTriggerPrice,
  isTakeProfit,
  triggerPriceSource,
  gainOrLossInputType,
  priceIncrement,
  positionCloseAmount,
  positionCloseAmountNetEntry,
  positionCloseAmountNetCostForPnl,
}: Params) {
  const formPriceValuesKey = getTpSlFormPriceValuesKey(isTakeProfit);

  // Update gainOrLossValue field when price field is updated.
  useEffect(() => {
    if (triggerPriceSource !== 'price') {
      return;
    }

    if (
      validTriggerPrice === undefined ||
      positionCloseAmountNetEntry === undefined ||
      positionCloseAmount === undefined ||
      positionCloseAmount.isZero() ||
      !positionCloseAmountNetCostForPnl
    ) {
      form.resetField(`${formPriceValuesKey}.gainOrLossValue`);
      return;
    }

    const gainOrLossInputValue = (() => {
      const gainOrLoss = calcPnl(
        positionCloseAmount,
        validTriggerPrice,
        positionCloseAmountNetEntry,
      ).multipliedBy(isTakeProfit ? 1 : -1); // Negate if SL such that "loss" values are positive

      switch (gainOrLossInputType) {
        case 'percentage': {
          const gainOrLossPercentage = calcPnlFrac(
            gainOrLoss,
            positionCloseAmountNetCostForPnl,
          ).multipliedBy(100);

          return roundToString(gainOrLossPercentage, 0);
        }
        case 'dollar': {
          return roundToString(gainOrLoss, 2);
        }
      }
    })();

    form.setValue(
      `${formPriceValuesKey}.gainOrLossValue`,
      gainOrLossInputValue,
      { shouldTouch: true, shouldValidate: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    validTriggerPrice,
    positionCloseAmount,
    positionCloseAmountNetEntry,
    gainOrLossInputType,
  ]);

  // Update price field when gainOrLossValue field is updated.
  useEffect(
    () => {
      if (triggerPriceSource !== 'gainOrLossValue') {
        return;
      }

      if (
        validGainOrLossValue === undefined ||
        priceIncrement === undefined ||
        positionCloseAmountNetEntry === undefined ||
        positionCloseAmount === undefined ||
        positionCloseAmount.isZero() ||
        !positionCloseAmountNetCostForPnl
      ) {
        form.resetField(`${formPriceValuesKey}.triggerPrice`);
        return;
      }

      const triggerPrice = (() => {
        const validGainOrLossValueWithSide = toBigNumber(
          validGainOrLossValue,
        ).multipliedBy(isTakeProfit ? 1 : -1); // Negate if SL to get negative values for loss

        switch (gainOrLossInputType) {
          case 'percentage': {
            // Percentage PnL calculation
            // Formula: triggerPrice = ((pnlPercentageValue / 100 * positionCloseAmountNetCostForPnl) + netEntry) / positionAmount.
            return validGainOrLossValueWithSide
              .dividedBy(100)
              .multipliedBy(positionCloseAmountNetCostForPnl)
              .plus(positionCloseAmountNetEntry)
              .dividedBy(positionCloseAmount);
          }
          case 'dollar': {
            // Dollar PnL calculation
            // Formula: triggerPrice = (pnlDollarValue + netEntry) / positionAmount
            return validGainOrLossValueWithSide
              .plus(positionCloseAmountNetEntry)
              .dividedBy(positionCloseAmount);
          }
        }
      })();

      form.setValue(
        `${formPriceValuesKey}.triggerPrice`,
        roundToIncrement(triggerPrice, priceIncrement).toString(),
        { shouldTouch: true, shouldValidate: true },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      validGainOrLossValue,
      positionCloseAmount,
      positionCloseAmountNetEntry,
      gainOrLossInputType,
    ],
  );
}
