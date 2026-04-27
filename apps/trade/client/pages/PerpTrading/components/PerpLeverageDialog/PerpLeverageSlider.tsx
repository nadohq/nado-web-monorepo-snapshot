import { RangeSlider } from 'client/components/RangeSlider/RangeSlider';
import { RangeSliderProps } from 'client/components/RangeSlider/types';
import { formatLeverage } from 'client/utils/formatLeverage';
import { range } from 'lodash';
import { useMemo } from 'react';

interface Props extends Pick<
  RangeSliderProps,
  'value' | 'onValueChange' | 'disabled' | 'className'
> {
  minLeverage: number;
  maxLeverage: number;
  leverageIncrement: number;
}

export function PerpLeverageSlider({
  minLeverage,
  maxLeverage,
  leverageIncrement,
  ...rest
}: Props) {
  const marks = useMemo(() => {
    return getLeverageMarks(maxLeverage);
  }, [maxLeverage]);

  const renderMarkLabel = (value: number) => {
    return formatLeverage(value);
  };

  return (
    <RangeSlider
      marks={marks}
      min={minLeverage}
      max={maxLeverage}
      step={leverageIncrement}
      renderMarkLabel={renderMarkLabel}
      {...rest}
    />
  );
}

function getLeverageMarks(max: number, min: number = 1): number[] {
  // Choose step size based on range
  let step;

  if (max <= 10) {
    step = 1;
  } else if (max <= 40) {
    step = 5;
  } else {
    step = 10;
  }

  // This is to ensure that the first mark is not repeated.
  // For example, if min is 1 and step is 1, the second mark will be 1 as well.
  const rangeStart = step === min ? step + min : step;

  return [min, ...range(rangeStart, max + step, step)];
}
