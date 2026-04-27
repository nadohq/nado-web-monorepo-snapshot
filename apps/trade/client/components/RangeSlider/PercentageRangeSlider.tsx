import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { RangeSlider } from 'client/components/RangeSlider/RangeSlider';
import { RangeSliderProps } from 'client/components/RangeSlider/types';

const MARKS = [0, 0.25, 0.5, 0.75, 1];

/**
 * A percentage range slider with a custom mark label formatter
 * @param props - The props for the range slider
 * @returns The percentage range slider
 */
export function PercentageRangeSlider(
  props: Pick<
    RangeSliderProps,
    'value' | 'onValueChange' | 'disabled' | 'hideLabels'
  >,
) {
  return (
    <RangeSlider
      renderMarkLabel={(val) => {
        return formatNumber(val, {
          formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
        });
      }}
      marks={MARKS}
      min={0}
      max={1}
      step={0.01}
      {...props}
    />
  );
}
