import { Select, useSelect } from '@nadohq/web-ui';
import { ALL_CHART_TIMESPANS } from 'client/modules/charts/consts';
import { ChartTimespan } from 'client/modules/charts/types';
import { getTimespanMetadata } from 'client/modules/charts/utils/timespan';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedTimespan: ChartTimespan;
  setSelectedTimespan: (timespan: ChartTimespan) => void;

  /** The timespan options to display. Default is all available timespans.
   *  @see ChartTimespan
   */
  timespanOptions?: readonly ChartTimespan[];
}

export function TimespanSelect({
  selectedTimespan,
  setSelectedTimespan,
  timespanOptions = ALL_CHART_TIMESPANS,
}: Props) {
  const { t } = useTranslation();
  const {
    value,
    open,
    onValueChange,
    onOpenChange,
    selectedOption,
    selectOptions,
  } = useSelect({
    options: timespanOptions.map((option) => {
      const { shortLabel: label, id: value } = getTimespanMetadata(t, option);
      return { label, value };
    }),
    selectedValue: selectedTimespan,
    onSelectedValueChange: setSelectedTimespan,
  });

  return (
    <Select.Root
      open={open}
      onValueChange={onValueChange}
      value={value}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger withChevron open={open}>
        {selectedOption?.label ?? t(($) => $.inputPlaceholders.select)}
      </Select.Trigger>
      <Select.Options className="w-24" align="end">
        {selectOptions.map(({ label, value }) => (
          <Select.Option key={value} value={value}>
            {label}
          </Select.Option>
        ))}
      </Select.Options>
    </Select.Root>
  );
}
