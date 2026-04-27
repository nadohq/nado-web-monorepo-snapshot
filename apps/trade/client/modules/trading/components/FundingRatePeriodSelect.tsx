import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { Select } from '@nadohq/web-ui';
import { useFundingRatePeriodSelect } from 'client/modules/trading/hooks/useFundingRatePeriodSelect';

export function FundingRatePeriodSelect({ className }: WithClassnames) {
  const {
    selectedOption,
    selectOptions,
    open,
    onValueChange,
    value,
    onOpenChange,
  } = useFundingRatePeriodSelect();

  return (
    <Select.Root
      open={open}
      onValueChange={onValueChange}
      value={value}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger
        withChevron
        open={open}
        className={mergeClassNames('min-w-12 bg-transparent', className)}
        // Propagation is undesirable here for all use cases
        // (eg. if select is within a table header we don't want to sort the table)
        onClick={(e) => e.stopPropagation()}
      >
        {selectedOption?.label}
      </Select.Trigger>
      <Select.Portal>
        <Select.Options>
          {selectOptions.map(({ label, value }) => (
            <Select.Option key={value} value={value}>
              {label}
            </Select.Option>
          ))}
        </Select.Options>
      </Select.Portal>
    </Select.Root>
  );
}
