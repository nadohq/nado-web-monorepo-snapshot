import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import {
  joinClassNames,
  mergeClassNames,
  WithClassnames,
} from '@nadohq/web-common';
import { useCountdownDuration } from 'client/hooks/ui/useCountdownDuration';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  endTimeMillis: number | undefined;
  valueClassName?: string;
  unitClassName?: string;
  segmentClassName?: string;
}

export function Countdown({
  endTimeMillis,
  valueClassName,
  unitClassName,
  segmentClassName,
  className,
}: Props) {
  const { t } = useTranslation();
  const duration = useCountdownDuration(endTimeMillis);

  return (
    <div className={joinClassNames('flex gap-x-2', className)}>
      <DurationSegment
        unit={t(($) => $.durations.days)}
        value={duration.days}
        valueClassName={valueClassName}
        unitClassName={unitClassName}
        className={segmentClassName}
      />
      <DurationSegment
        unit={t(($) => $.durations.hours)}
        value={duration.hours}
        valueClassName={valueClassName}
        unitClassName={unitClassName}
        className={segmentClassName}
      />
      <DurationSegment
        unit={t(($) => $.durations.minutes)}
        value={duration.minutes}
        valueClassName={valueClassName}
        unitClassName={unitClassName}
        className={segmentClassName}
      />
      <DurationSegment
        unit={t(($) => $.durations.seconds)}
        value={duration.seconds}
        valueClassName={valueClassName}
        unitClassName={unitClassName}
        className={segmentClassName}
      />
    </div>
  );
}

interface DurationSegmentProps extends WithClassnames {
  unit: string;
  value: number;
  valueClassName?: string;
  unitClassName?: string;
}

function DurationSegment({
  unit,
  value,
  valueClassName,
  unitClassName,
  className,
}: DurationSegmentProps) {
  return (
    <div
      className={mergeClassNames(
        // Static width to prevent layout shift as numbers/units change
        'flex w-15 flex-col items-center gap-y-1',
        'border-stroke border py-2.5',
        className,
      )}
    >
      <div
        className={joinClassNames(
          'text-text-primary text-xl lg:text-3xl',
          valueClassName,
        )}
      >
        {formatNumber(value, {
          formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
        })}
      </div>
      <div
        className={mergeClassNames('text-text-tertiary text-xs', unitClassName)}
      >
        {unit}
      </div>
    </div>
  );
}
