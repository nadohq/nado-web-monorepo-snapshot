import { Select, SelectOption, useSelect } from '@nadohq/web-ui';
import { TimeInForceType } from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  timeInForceType: TimeInForceType;
  setTimeInForceType: (value: TimeInForceType) => void;
}

export function TimeInForceTypeSelect({
  timeInForceType,
  setTimeInForceType,
}: Props) {
  const { t } = useTranslation();

  const options: SelectOption<TimeInForceType>[] = useMemo(
    () => [
      {
        label: t(($) => $.timeInForce.gtc),
        value: 'gtc',
      },
      {
        label: t(($) => $.timeInForce.ioc),
        value: 'ioc',
      },
      {
        label: t(($) => $.timeInForce.fok),
        value: 'fok',
      },
      {
        label: t(($) => $.timeInForce.goodUntil),
        value: 'good_until',
      },
    ],
    [t],
  );

  const {
    selectOptions,
    selectedOption,
    open,
    onValueChange,
    value,
    onOpenChange,
  } = useSelect({
    selectedValue: timeInForceType,
    onSelectedValueChange: setTimeInForceType,
    options,
  });

  return (
    <Select.Root
      open={open}
      onValueChange={onValueChange}
      value={value}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger withChevron open={open} className="min-w-24">
        {selectedOption?.label}
      </Select.Trigger>
      <Select.Options>
        {selectOptions.map(({ label, value }) => (
          <Select.Option key={value} value={value}>
            {label}
          </Select.Option>
        ))}
      </Select.Options>
    </Select.Root>
  );
}
