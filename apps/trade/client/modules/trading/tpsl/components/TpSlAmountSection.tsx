import { Checkbox } from '@nadohq/web-ui';
import { CheckedState } from '@radix-ui/react-checkbox';
import { BigNumber } from 'bignumber.js';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { PercentageRangeSlider } from 'client/components/RangeSlider/PercentageRangeSlider';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import {
  TpSlOrderFormAmountState,
  TpSlOrderFormValues,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useTpSlAmountErrorTooltipContent } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlAmountErrorTooltipContent';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  form: UseFormReturn<TpSlOrderFormValues>;
  amountState: TpSlOrderFormAmountState;
  marketSymbol: string | undefined;
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  onFractionChange: (fraction: number) => void;
}

export function TpSlAmountSection({
  form,
  amountState,
  marketSymbol,
  decimalAdjustedSizeIncrement,
  onFractionChange,
}: Props) {
  const { t } = useTranslation();

  const isPartialOrderChecked = useWatch({
    control: form.control,
    name: 'isPartialOrder',
  });
  const onIsPartialOrderCheckedChange = (checked: CheckedState) => {
    form.setValue('isPartialOrder', !!checked);
  };

  const amountErrorTooltipContent = useTpSlAmountErrorTooltipContent({
    error: amountState.amountInputError,
    minOrderSize: amountState.minOrderSize,
    maxOrderSize: amountState.maxOrderSize,
    decimalAdjustedSizeIncrement,
  });

  const sizePlaceholder = useNumericInputPlaceholder({
    increment: decimalAdjustedSizeIncrement,
  });

  return (
    <div className="flex flex-col gap-3">
      <Checkbox.Row>
        <Checkbox.Check
          id="partial-order"
          sizeVariant="xs"
          checked={isPartialOrderChecked}
          onCheckedChange={onIsPartialOrderCheckedChange}
          dataTestId="tpsl-amount-section-partial-order-checkbox"
        />
        <Checkbox.Label id="partial-order" sizeVariant="xs">
          {t(($) => $.partialOrder)}
        </Checkbox.Label>
      </Checkbox.Row>
      {isPartialOrderChecked && (
        <>
          <NumberInputWithLabel
            {...form.register('amount', {
              validate: amountState.validateAmountInput,
            })}
            label={t(($) => $.size)}
            placeholder={sizePlaceholder}
            errorTooltipContent={amountErrorTooltipContent}
            step={decimalAdjustedSizeIncrement?.toString()}
            onFocus={() => {
              form.setValue('amountSource', 'absolute');
            }}
            endElement={marketSymbol}
            dataTestId="tpsl-amount-section-size-input"
          />
          <PercentageRangeSlider
            value={amountState.amountFractionInput}
            onValueChange={onFractionChange}
          />
        </>
      )}
    </div>
  );
}
