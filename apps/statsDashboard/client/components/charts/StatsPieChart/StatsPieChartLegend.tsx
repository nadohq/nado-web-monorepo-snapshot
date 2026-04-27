import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { LegendPayload } from 'recharts/types/component/DefaultLegendContent';

interface Props extends WithClassnames {
  payload: readonly LegendPayload[] | undefined;
}

export function StatsPieChartLegend({ payload, className }: Props) {
  if (!payload) {
    return null;
  }

  return (
    <div className={joinClassNames('flex flex-col gap-y-1', className)}>
      {payload.map(({ value, color }) => (
        <li
          className="text-text-primary text-3xs flex flex-row items-center gap-x-0.5 font-medium text-nowrap"
          key={value}
        >
          {color && (
            <span
              style={{ backgroundColor: color }}
              className="size-1.5 rounded-full"
            />
          )}
          {value}
        </li>
      ))}
    </div>
  );
}
