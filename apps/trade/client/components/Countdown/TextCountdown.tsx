'use client';

import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { useCountdownDuration } from 'client/hooks/ui/useCountdownDuration';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  endTimeMillis: number | undefined;
  valueClassName?: string;
  unitClassName?: string;
}

export function TextCountdown({
  endTimeMillis,
  valueClassName,
  unitClassName,
  className,
}: Props) {
  const { t } = useTranslation();
  const duration = useCountdownDuration(endTimeMillis);

  return (
    <div className={mergeClassNames('flex items-center gap-x-4', className)}>
      <DurationSegment
        unit={t(($) => $.durations.daysAbbrev)}
        value={duration.days}
        valueClassName={valueClassName}
        unitClassName={unitClassName}
      />
      <DurationSegment
        unit={t(($) => $.durations.hoursAbbrev)}
        value={duration.hours}
        valueClassName={valueClassName}
        unitClassName={unitClassName}
      />
      <DurationSegment
        unit={t(($) => $.durations.minutesAbbrev)}
        value={duration.minutes}
        valueClassName={valueClassName}
        unitClassName={unitClassName}
      />
      <DurationSegment
        unit={t(($) => $.durations.secondsAbbrev)}
        value={duration.seconds}
        valueClassName={valueClassName}
        unitClassName={unitClassName}
      />
    </div>
  );
}

interface DurationSegmentProps {
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
}: DurationSegmentProps) {
  const formattedValue = formatNumber(value, {
    formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
  });

  return (
    <div className="flex items-center gap-x-1">
      <span
        className={mergeClassNames(
          'text-text-primary tabular-nums',
          valueClassName,
        )}
      >
        {formattedValue}
      </span>
      <span className={mergeClassNames('text-text-tertiary', unitClassName)}>
        {unit}
      </span>
    </div>
  );
}
