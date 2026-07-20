import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { safeParseForData } from '@nadohq/web-common';
import { RangeSlider } from 'client/components/RangeSlider/RangeSlider';
import {
  TpSlOrderFormPriceState,
  TpSlOrderFormValues,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { finiteBigNumberValidator } from 'client/utils/inputValidators';
import { roundToString } from 'client/utils/rounding';
import { useCallback } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Props {
  form: UseFormReturn<TpSlOrderFormValues>;
  priceState: TpSlOrderFormPriceState;
}

const MIN = 0;
const MAX = 1.5;
const STEP = 0.01;
const MARKS = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5];

/**
 * Slider for setting the gain (TP) or loss (SL) as a percentage of position cost.
 * Range is fixed to 0–150%. Moving the slider switches the gain/loss input to
 * percentage mode and drives the trigger price via the existing form side effects.
 */
export function TpSlPnlFractionSlider({ form, priceState }: Props) {
  const { formPriceValuesKey, estimatedPnlFrac, isTakeProfit } = priceState;

  const [gainOrLossInputType, gainOrLossValue, triggerPriceSource] = useWatch({
    control: form.control,
    name: [
      `${formPriceValuesKey}.gainOrLossInputType`,
      `${formPriceValuesKey}.gainOrLossValue`,
      `${formPriceValuesKey}.triggerPriceSource`,
    ],
  });

  const sliderValue = (() => {
    if (gainOrLossInputType === 'percentage') {
      const validGainOrLossValue = safeParseForData(
        finiteBigNumberValidator,
        gainOrLossValue,
      );
      return validGainOrLossValue?.dividedBy(100).toNumber() ?? MIN;
    }
    // Match gain/loss input semantics: TP uses signed PnL (can be negative),
    // SL negates so loss is positive. Values below 0 clamp to MIN via RangeSlider.
    return (
      estimatedPnlFrac?.multipliedBy(isTakeProfit ? 1 : -1).toNumber() ?? MIN
    );
  })();

  const onValueChange = useCallback(
    (fraction: number) => {
      const percentString = roundToString(fraction * 100, 0);

      if (gainOrLossInputType !== 'percentage') {
        form.setValue(
          `${formPriceValuesKey}.gainOrLossInputType`,
          'percentage',
        );
      }

      if (triggerPriceSource !== 'gainOrLossValue') {
        form.setValue(
          `${formPriceValuesKey}.triggerPriceSource`,
          'gainOrLossValue',
        );
      }

      form.setValue(`${formPriceValuesKey}.gainOrLossValue`, percentString, {
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [form, formPriceValuesKey, gainOrLossInputType, triggerPriceSource],
  );

  return (
    <RangeSlider
      value={sliderValue}
      onValueChange={onValueChange}
      min={MIN}
      max={MAX}
      step={STEP}
      marks={MARKS}
      renderMarkLabel={(val) => {
        // Only label the first and last marks per design
        if (val !== MIN && val !== MAX) {
          return '';
        }
        return formatNumber(val, {
          formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
        });
      }}
    />
  );
}
