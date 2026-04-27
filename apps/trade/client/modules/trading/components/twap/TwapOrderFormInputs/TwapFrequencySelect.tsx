import { Select, useSelect } from '@nadohq/web-ui';
import { TWAP_FREQUENCY_PRESETS } from 'client/modules/trading/components/twap/consts';
import { useCallback } from 'react';

const FREQUENCY_OPTIONS = Object.entries(TWAP_FREQUENCY_PRESETS).map(
  ([label, value]) => ({ label, value }),
);

interface Props {
  value: number | undefined;
  onValueChange: (value: number) => void;
}

/**
 * Frequency select component for TWAP orders
 */
export function TwapFrequencySelect({ value, onValueChange }: Props) {
  const onFrequencyValueChange = useCallback(
    (val: number) => onValueChange(val),
    [onValueChange],
  );

  const {
    open,
    onValueChange: selectOnValueChange,
    onOpenChange,
    selectedOption,
    selectOptions,
    value: selectValue,
  } = useSelect({
    selectedValue: value,
    onSelectedValueChange: onFrequencyValueChange,
    options: FREQUENCY_OPTIONS,
  });

  return (
    <Select.Root
      value={selectValue}
      open={open}
      onValueChange={selectOnValueChange}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger
        withChevron
        className="w-fit min-w-[8ch] text-xs"
        open={open}
        data-testid="twap-order-form-frequency-select"
      >
        {selectedOption?.label}
      </Select.Trigger>
      <Select.Options>
        {selectOptions.map(({ label, value }) => {
          return (
            <Select.Option
              value={value}
              key={label}
              data-testid={`twap-order-form-frequency-select-option-${label}`}
            >
              {label}
            </Select.Option>
          );
        })}
      </Select.Options>
    </Select.Root>
  );
}
