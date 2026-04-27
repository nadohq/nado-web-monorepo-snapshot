import { WithClassnames, joinClassNames } from '@nadohq/web-common';
import { TabTextButton } from '@nadohq/web-ui';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { ALL_CHART_TIMESPANS } from 'client/modules/charts/consts';
import { ChartTimespan } from 'client/modules/charts/types';
import { getTimespanMetadata } from 'client/modules/charts/utils/timespan';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

export interface ChartTimespanRadioGroupProps extends WithClassnames {
  timespan: ChartTimespan;
  disabled?: boolean;
  setTimespan: Dispatch<SetStateAction<ChartTimespan>>;

  /** The timespan options to display. Default is all available timespans.
   *  @see ChartTimespan
   */
  timespanOptions?: readonly ChartTimespan[];
}

export function ChartTimespanRadioGroup({
  className,
  timespan,
  setTimespan,
  timespanOptions = ALL_CHART_TIMESPANS,
}: ChartTimespanRadioGroupProps) {
  const { t } = useTranslation();

  return (
    <RadioGroup.Root
      value={timespan}
      onValueChange={(value) => setTimespan(value as ChartTimespan)}
      className={joinClassNames('flex items-center', className)}
    >
      {timespanOptions.map((option) => {
        const { shortLabel: label } = getTimespanMetadata(t, option);
        return (
          <RadioGroup.Item key={option} value={option} asChild>
            <TabTextButton className="p-1 text-xs" active={timespan === option}>
              {label}
            </TabTextButton>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
