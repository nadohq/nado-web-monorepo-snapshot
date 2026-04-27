import { truncateAddress } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { TextButton } from '@nadohq/web-ui';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { LegendPayload } from 'recharts/types/component/DefaultLegendContent';

interface Props {
  payload: readonly LegendPayload[] | undefined;
  setHiddenAddresses: Dispatch<SetStateAction<Record<string, boolean>>>;
}

export function MakerMetricChartLegend({ payload, setHiddenAddresses }: Props) {
  // Toggle the visibility of data for the address
  const toggleHiddenAddress = useCallback(
    (address: string) => {
      setHiddenAddresses((prevHiddenAddresses) => {
        return {
          ...prevHiddenAddresses,
          [address]: !prevHiddenAddresses[address],
        };
      });
    },
    [setHiddenAddresses],
  );

  return (
    <div className="flex w-full gap-x-2.5 pt-4 pb-2">
      {payload?.map(({ dataKey, inactive, color }, index) => {
        const address = dataKey as string;
        const label = truncateAddress(address);
        const circleStyles = !inactive
          ? {
              backgroundColor: color,
            }
          : undefined;

        return (
          <TextButton
            colorVariant="secondary"
            key={`item-${index}`}
            className={joinClassNames(
              'text-xs text-nowrap',
              inactive && 'line-through',
            )}
            onClick={() => toggleHiddenAddress(address)}
          >
            {/* Colored circle */}
            <span
              className="bg-disabled size-2 rounded-full"
              style={circleStyles}
            />
            {label}
          </TextButton>
        );
      })}
    </div>
  );
}
