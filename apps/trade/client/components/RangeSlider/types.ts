import { WithClassnames } from '@nadohq/web-common';
import { ReactNode } from 'react';

export interface RangeSliderProps extends WithClassnames {
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Whether to hide the labels */
  hideLabels?: boolean;
  /** Value of the marks to render along the track. Should be memoized or a stable reference */
  marks: number[];
  /** The maximum value of the slider */
  max: number;
  /** The minimum value of the slider */
  min: number;
  /** Callback to update the slider value */
  onValueChange: (value: number) => void;
  /** Optional function to render the label instead of the default format */
  renderMarkLabel?: (value: number) => ReactNode;
  /** The step size of the slider */
  step: number;
  /** The current value of the slider */
  value: number;
}
