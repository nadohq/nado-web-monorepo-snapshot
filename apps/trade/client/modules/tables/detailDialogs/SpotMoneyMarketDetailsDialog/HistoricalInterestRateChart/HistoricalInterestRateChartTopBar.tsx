import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { SegmentedControl } from '@nadohq/web-ui';
import { ChartTimespanRadioGroup } from 'client/modules/charts/components/ChartTimespanRadioGroup';
import { ChartTimespan } from 'client/modules/charts/types';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  timespan: ChartTimespan;
  setTimespan: Dispatch<SetStateAction<ChartTimespan>>;
  isDeposit: boolean;
  setIsDeposit: (isDeposit: boolean) => void;
}

export function HistoricalInterestRateChartTopBar({
  className,
  timespan,
  setTimespan,
  isDeposit,
  setIsDeposit,
}: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={joinClassNames(
        'flex flex-col gap-y-2',
        'sm:flex-row sm:items-center sm:justify-between sm:gap-x-4',
        className,
      )}
    >
      <SegmentedControl.Container>
        <SegmentedControl.Button
          className="flex-1"
          size="xs"
          active={isDeposit}
          onClick={() => setIsDeposit(true)}
        >
          {t(($) => $.buttons.deposit)}
        </SegmentedControl.Button>
        <SegmentedControl.Button
          className="flex-1"
          size="xs"
          active={!isDeposit}
          onClick={() => setIsDeposit(false)}
        >
          {t(($) => $.buttons.borrow)}
        </SegmentedControl.Button>
      </SegmentedControl.Container>
      <ChartTimespanRadioGroup
        timespan={timespan}
        setTimespan={setTimespan}
        className="self-end sm:self-auto"
      />
    </div>
  );
}
