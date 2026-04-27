import { WithClassnames } from '@nadohq/web-common';
import { formatTimestamp, TimeFormatSpecifier } from '@nadohq/web-ui';

interface Props extends WithClassnames {
  timestampMillis: number;
  dateClassName?: string;
  timeClassName?: string;
}

export function DateTime({
  timestampMillis,
  className,
  dateClassName,
  timeClassName,
}: Props) {
  const formattedDate = formatTimestamp(timestampMillis, {
    formatSpecifier: TimeFormatSpecifier.MONTH_D_YYYY,
  });
  const formattedTime = formatTimestamp(timestampMillis, {
    formatSpecifier: TimeFormatSpecifier.HH_MM_SS_12H,
  });

  return (
    <div className={className}>
      <span className={dateClassName}>{formattedDate}</span>
      <span className={timeClassName}>{formattedTime}</span>
    </div>
  );
}
