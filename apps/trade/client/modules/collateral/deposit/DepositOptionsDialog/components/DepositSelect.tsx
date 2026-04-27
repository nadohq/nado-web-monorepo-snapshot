import { BaseTestProps } from '@nadohq/web-common';
import { Select, useSelect } from '@nadohq/web-ui';
import { DepositSelectOption } from 'client/modules/collateral/deposit/DepositOptionsDialog/types';
import Image from 'next/image';
import { ReactNode, useMemo } from 'react';

interface Props<
  TSelectOption extends BaseTestProps & DepositSelectOption,
> extends BaseTestProps {
  selectedValue: TSelectOption | undefined;
  options: TSelectOption[];
  disabled?: boolean;
  placeholder: ReactNode;
  altText: string;
  onSelectedValueChange: (option: TSelectOption) => void;
}

export function DepositSelect<
  TSelectOption extends BaseTestProps & DepositSelectOption,
>({
  selectedValue,
  options: optionValues,
  disabled,
  placeholder,
  altText,
  onSelectedValueChange,
  dataTestId,
}: Props<TSelectOption>) {
  const options = useMemo(
    () =>
      optionValues.map((option) => ({ label: option.label, value: option })),
    [optionValues],
  );

  const {
    selectOptions,
    selectedOption,
    open,
    onValueChange,
    value,
    onOpenChange,
  } = useSelect({
    selectedValue,
    onSelectedValueChange,
    options,
  });

  return (
    <Select.Root
      open={open}
      onValueChange={onValueChange}
      value={value}
      onOpenChange={onOpenChange}
      disabled={disabled}
    >
      <Select.Trigger
        className="text-sm"
        withChevron
        open={open}
        borderRadiusVariant="sm"
        disabled={disabled}
        dataTestId={dataTestId}
      >
        {selectedOption ? (
          <div className="flex items-center gap-x-2">
            <Image
              src={selectedOption.value.icon}
              alt={altText}
              width={18}
              height={18}
            />
            <span className="text-text-primary">{selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-text-tertiary">{placeholder}</span>
        )}
      </Select.Trigger>
      <Select.Options className="max-h-52">
        {selectOptions.map(({ value: optionValue, original }) => (
          <Select.Option
            key={optionValue}
            value={optionValue}
            withSelectedCheckmark={false}
            dataTestId={`deposit-option-${original.label.toLowerCase().replace(' ', '-')}-select-option`}
          >
            <Image src={original.icon} alt={altText} width={20} height={20} />
            <span>{original.label}</span>
          </Select.Option>
        ))}
      </Select.Options>
    </Select.Root>
  );
}
