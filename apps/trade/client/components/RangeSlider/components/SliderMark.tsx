import { joinClassNames } from '@nadohq/web-common';
import { RangeSliderProps } from 'client/components/RangeSlider/types';
import { IMarkProps } from 'react-range/lib/types';

interface Props
  extends
    Pick<
      RangeSliderProps,
      'step' | 'max' | 'min' | 'hideLabels' | 'renderMarkLabel' | 'disabled'
    >,
    IMarkProps {
  /**
   * Value that the mark represents.
   */
  markValue: number;
  /**
   * Current value of the slider to determine if the mark is active
   */
  currentValue: number;
  /**
   * Index of the mark in the marks array
   */
  index: number;
}

export function SliderMark({
  markValue,
  currentValue,
  hideLabels,
  renderMarkLabel,
  index,
  min,
  max,
  step,
  disabled,
  ...markProps
}: Props) {
  // Absolutely positioned label that sits below the mark
  const labelContent = (() => {
    if (hideLabels) return null;

    const isFirst = index === 0;
    const isLast = index === (max - min) / step;

    // We want first/last marks to align with the edges of the track
    const horizontalLabelAlignment = (() => {
      if (isFirst) return 'left-0';
      if (isLast) return 'right-0';
      return 'left-1/2 -translate-x-1/2';
    })();

    const markLabel = renderMarkLabel?.(markValue) ?? markValue.toString();

    return (
      <span
        className={joinClassNames(
          // 3xs => 10px
          'text-text-tertiary text-3xs absolute',
          // The thumb is 16px, but marks are only 10px, push the label down by 4px to give vertical space
          // This means that with the labels, the total height of the slider is increased by 1px (distance from bottom of thumb) + 10px (label height) = 11px
          'translate-y-1',
          horizontalLabelAlignment,
        )}
      >
        {markLabel}
      </span>
    );
  })();

  return (
    <div className="relative" {...markProps}>
      <div
        className={joinClassNames(
          'size-2.5 rounded-full border-2',
          !disabled && currentValue >= markValue
            ? 'bg-accent border-accent'
            : 'bg-surface-card border-overlay-divider',
        )}
      />
      {labelContent}
    </div>
  );
}
