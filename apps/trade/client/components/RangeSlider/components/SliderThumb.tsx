import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { IThumbProps } from 'react-range/lib/types';

interface Props extends WithClassnames, IThumbProps {
  /** Whether the slider is disabled */
  disabled?: boolean;
}

/**
 * Renders the draggable thumb
 */
export function SliderThumb({ disabled, className, ...rest }: Props) {
  if (disabled) {
    return null;
  }
  return (
    // Outer ring
    <div
      className={joinClassNames(
        'flex size-4 items-center justify-center',
        'border-background bg-accent rounded-full border',
        'focus:ring-accent/30 transition-shadow duration-150 focus:ring-1',
        className,
      )}
      {...rest}
    >
      {/* Inner circle */}
      <div className="bg-background size-2.5 rounded-full" />
    </div>
  );
}
