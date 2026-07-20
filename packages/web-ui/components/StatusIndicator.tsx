import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { SizeVariant } from '../types';

interface Props extends WithClassnames {
  sizeVariant?: Extract<SizeVariant, 'sm' | 'base'>;
  colorVariant: 'warning' | 'positive' | 'negative' | 'accent-info';
  /**
   * When enabled, the outer ring pulses outward to draw attention (e.g. a
   * "live" state).
   */
  pulse?: boolean;
}

export function StatusIndicator({
  sizeVariant = 'base',
  colorVariant,
  pulse,
  className,
}: Props) {
  const sizeClassnames = {
    sm: { outer: 'size-2.5', middle: 'size-2', inner: 'size-1.5' },
    base: { outer: 'size-4', middle: 'size-3', inner: 'size-1.5' },
  }[sizeVariant];

  const colorClassNames = {
    'accent-info': {
      outer: 'bg-accent-info/20',
      middle: 'bg-accent-info/20',
      inner: 'bg-accent-info',
    },
    warning: {
      outer: 'bg-warning/20',
      middle: 'bg-warning/20',
      inner: 'bg-warning',
    },
    positive: {
      outer: 'bg-positive/20',
      middle: 'bg-positive/20',
      inner: 'bg-positive',
    },
    negative: {
      outer: 'bg-negative/20',
      middle: 'bg-negative/20',
      inner: 'bg-negative',
    },
  }[colorVariant];

  return (
    // Flex is required here for `inset-0 m-auto` on children to work
    <span className={joinClassNames('relative isolate flex', className)}>
      <span
        className={joinClassNames(
          'rounded-full',
          sizeClassnames.outer,
          colorClassNames.outer,
          // The static middle/inner rings remain, so the outer ring pinging
          // outward reads as a subtle radar-style pulse.
          pulse && 'animate-ping',
        )}
      />
      <span
        className={joinClassNames(
          'absolute inset-0 m-auto rounded-full',
          sizeClassnames.middle,
          colorClassNames.middle,
        )}
      />
      <span
        className={joinClassNames(
          'absolute inset-0 m-auto rounded-full',
          sizeClassnames.inner,
          colorClassNames.inner,
        )}
      />
    </span>
  );
}
