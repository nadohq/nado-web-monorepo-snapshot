import { mergeClassNames } from '@nadohq/web-common';
import { SliderMark } from 'client/components/RangeSlider/components/SliderMark';
import { SliderThumb } from 'client/components/RangeSlider/components/SliderThumb';
import { SliderTrack } from 'client/components/RangeSlider/components/SliderTrack';
import { RangeSliderProps } from 'client/components/RangeSlider/types';
import { useMemo } from 'react';
import { checkValuesAgainstBoundaries, Range } from 'react-range';

/**
 * RangeSlider component with configurable marks and labels
 *
 */
export function RangeSlider({
  className,
  value,
  onValueChange,
  disabled,
  min,
  max,
  step,
  marks,
  renderMarkLabel,
  hideLabels,
}: RangeSliderProps) {
  // Memoized range values for react-range
  const rangeValues = useMemo(() => {
    // Calculate slider value with clamping
    // This is to prevent an invalid state if the value is outside the min/max range
    return [checkValuesAgainstBoundaries(value, min, max)];
  }, [value, min, max]);
  const marksSet = useMemo(() => {
    return new Set(marks);
  }, [marks]);

  return (
    <div
      className={mergeClassNames(
        // Horizontal padding to align first/last mark with edges of the container
        // Each mark is 10px wide, so 5px padding on each side
        'relative px-1.25',
        // Label adds 11px of height (see SliderMark), so add extra padding to ensure container size is correct
        !hideLabels && 'pb-2.75',
        disabled && 'cursor-not-allowed',
        className,
      )}
    >
      <Range
        disabled={disabled}
        values={rangeValues}
        step={step}
        min={min}
        max={max}
        onChange={(values) => onValueChange(values[0])}
        renderTrack={({ props, children }) => (
          <SliderTrack
            rangeValues={rangeValues}
            min={min}
            max={max}
            disabled={disabled}
            {...props}
          >
            {children}
          </SliderTrack>
        )}
        renderThumb={({ props: { key, ...rest } }) => (
          <SliderThumb key={key} disabled={disabled} {...rest} />
        )}
        renderMark={({ index, props: { key, ...rest } }) => {
          const markValue = index * step + min;
          if (!marksSet.has(markValue)) {
            return null;
          }

          return (
            <SliderMark
              key={key}
              markValue={markValue}
              currentValue={value}
              hideLabels={hideLabels}
              renderMarkLabel={renderMarkLabel}
              index={index}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              {...rest}
            />
          );
        }}
      />
    </div>
  );
}
