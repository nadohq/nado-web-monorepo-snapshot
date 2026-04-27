import { formatDurationMillis, TimeFormatSpecifier } from '@nadohq/web-ui';
import { useInterval } from 'ahooks';
import { StackedValues } from 'client/modules/tables/components/StackedValues';
import { useCallback, useState } from 'react';

interface Props {
  timePlacedMillis: number;
  totalRuntimeInMillis: number;
}

const RUNTIME_UPDATE_INTERVAL_MILLIS = 1000;
/**
 * Displays the real-time elapsed runtime for a time trigger order
 * @param props
 * @returns
 */
export function TwapOrderRuntimeDisplay({
  timePlacedMillis,
  totalRuntimeInMillis,
}: Props) {
  const [elapsedRuntimeInMillis, setElapsedRuntimeInMillis] = useState(0);

  const updateElapsedTime = useCallback(() => {
    const nowMillis = Date.now();
    const elapsedMillis = Math.min(
      nowMillis - timePlacedMillis,
      totalRuntimeInMillis,
    );

    setElapsedRuntimeInMillis(elapsedMillis);
  }, [timePlacedMillis, totalRuntimeInMillis]);

  useInterval(updateElapsedTime, RUNTIME_UPDATE_INTERVAL_MILLIS, {
    immediate: true,
  });

  return (
    <StackedValues
      top={formatDurationMillis(elapsedRuntimeInMillis, {
        formatSpecifier: TimeFormatSpecifier.HH_MM_SS,
      })}
      bottom={formatDurationMillis(totalRuntimeInMillis, {
        formatSpecifier: TimeFormatSpecifier.HH_MM_SS,
      })}
    />
  );
}
