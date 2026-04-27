import { WithChildren } from '@nadohq/web-common';
import { RangeSliderProps } from 'client/components/RangeSlider/types';
import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import { getTrackBackground } from 'react-range';
import { ITrackProps } from 'react-range/lib/types';

interface Props
  extends
    Pick<RangeSliderProps, 'min' | 'max' | 'disabled'>,
    WithChildren,
    ITrackProps {
  /** The current values of the slider */
  rangeValues: number[];
}

/**
 * Slider track component with integrated marks and labels rendering
 */
export function SliderTrack({
  children,
  rangeValues,
  min,
  max,
  disabled,
  style,
  ...trackProps
}: Props) {
  const { ref: trackRef, ...rest } = trackProps;

  return (
    // Outer container to make the clickable area larger, set to the same height as the thumb
    <div className="h-4" style={style} {...rest}>
      <div
        // Vertically center the visible track
        className="relative top-1/2 h-1 -translate-y-1/2"
        style={{
          background: getTrackBackgroundGradient({
            rangeValues,
            min,
            max,
            disabled,
          }),
        }}
        ref={trackRef}
      >
        {/* react-range inserts mark / thumb as children */}
        {children}
      </div>
    </div>
  );
}

/**
 * Get the background color of the track
 * @returns The background color of the track with a consideration for disabled state
 * @see https://github.com/tajo/react-range?tab=readme-ov-file#gettrackbackground
 */
function getTrackBackgroundGradient({
  rangeValues,
  min,
  max,
  disabled,
}: Pick<Props, 'rangeValues' | 'min' | 'max' | 'disabled'>) {
  return disabled
    ? getResolvedColorValue('overlay-divider')
    : getTrackBackground({
        values: rangeValues,
        colors: [
          getResolvedColorValue('primary'),
          getResolvedColorValue('overlay-divider'),
        ],
        min,
        max,
      });
}
