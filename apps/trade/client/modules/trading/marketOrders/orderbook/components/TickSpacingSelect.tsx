import { Select, useSelect } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import {
  ORDERBOOK_PRICE_TICK_SPACING_MULTIPLIERS,
  OrderbookPriceTickSpacingMultiplier,
} from 'client/modules/trading/marketOrders/orderbook/types';
import { useMemo } from 'react';

interface TickSpacingSelectProps {
  priceIncrement: BigNumber | undefined;
  currentTickSpacing: number;
  tickSpacingMultiplier: OrderbookPriceTickSpacingMultiplier;
  setTickSpacingMultiplier: (
    value: OrderbookPriceTickSpacingMultiplier,
  ) => void;
}

export function TickSpacingSelect({
  priceIncrement,
  tickSpacingMultiplier,
  currentTickSpacing,
  setTickSpacingMultiplier,
}: TickSpacingSelectProps) {
  const options = useMemo(() => {
    return ORDERBOOK_PRICE_TICK_SPACING_MULTIPLIERS.map((multiplier) => ({
      label: priceIncrement?.multipliedBy(multiplier).toFixed() ?? 1,
      value: multiplier,
    }));
  }, [priceIncrement]);

  const { selectOptions, open, onValueChange, value, onOpenChange } = useSelect(
    {
      selectedValue: tickSpacingMultiplier,
      onSelectedValueChange: setTickSpacingMultiplier,
      options,
    },
  );

  return (
    <Select.Root
      open={open}
      onValueChange={onValueChange}
      value={value}
      onOpenChange={onOpenChange}
    >
      <Select.TextTrigger className="text-2xs" open={open} withChevron>
        {currentTickSpacing}
      </Select.TextTrigger>
      <Select.Options className="min-w-20" align="end">
        {selectOptions.map(({ label, value }) => (
          <Select.Option key={value} value={value}>
            {label}
          </Select.Option>
        ))}
      </Select.Options>
    </Select.Root>
  );
}
