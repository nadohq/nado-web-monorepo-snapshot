import { Select, SelectOption, useSelect } from '@nadohq/web-ui';
import {
  GainOrLossInputType,
  TpSlOrderFormPriceState,
  TpSlOrderFormValues,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useCallback } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Props {
  form: UseFormReturn<TpSlOrderFormValues>;
  priceState: TpSlOrderFormPriceState;
}

const OPTIONS: SelectOption<GainOrLossInputType>[] = [
  {
    label: '%',
    value: 'percentage',
  },
  {
    label: '$',
    value: 'dollar',
  },
] as const;

export function TpSlGainOrLossInputTypeSelect({ form, priceState }: Props) {
  const formPriceValuesKey = priceState.formPriceValuesKey;

  const onSelectedValueChange = useCallback(
    (val: GainOrLossInputType) => {
      form.setValue(`${formPriceValuesKey}.gainOrLossInputType`, val);
      // Reset trigger price source to 'price' when gain/loss input type changes
      // so that the gainOrLossValue is recalculated based on current trigger price.
      // E.g. user switches from 2000 gain in $ to %, we keep trigger price the same
      //      and may have gain value updated to, say, 330%.
      //      this is to avoid setting an unrealistic trigger price if we were to
      //      use 2000 % gain as source.
      form.setValue(`${formPriceValuesKey}.triggerPriceSource`, 'price');
    },
    [form, formPriceValuesKey],
  );

  const selectedValue = useWatch({
    control: form.control,
    name: `${formPriceValuesKey}.gainOrLossInputType`,
  });

  const {
    open,
    onValueChange,
    onOpenChange,
    selectedOption,
    selectOptions,
    value,
  } = useSelect({
    selectedValue,
    onSelectedValueChange,
    options: OPTIONS,
  });

  return (
    <Select.Root
      value={value}
      open={open}
      onValueChange={onValueChange}
      onOpenChange={onOpenChange}
    >
      {/* min-width to prevent layout shift on change */}
      <Select.TextTrigger className="min-w-[4ch]" open={open} withChevron>
        {selectedOption?.label}
      </Select.TextTrigger>
      <Select.Options align="end">
        {selectOptions.map(({ label, value }) => (
          <Select.Option key={label} value={value}>
            {label}
          </Select.Option>
        ))}
      </Select.Options>
    </Select.Root>
  );
}
