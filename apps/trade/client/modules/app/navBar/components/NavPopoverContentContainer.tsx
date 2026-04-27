import {
  mergeClassNames,
  WithChildren,
  WithClassnames,
  WithRef,
} from '@nadohq/web-common';
import { AnimatedCard, AnimationContainer } from '@nadohq/web-ui';

export function NavPopoverContentContainer({
  className,
  children,
  ...rest
}: WithRef<WithClassnames<WithChildren>, HTMLDivElement>) {
  return (
    <AnimationContainer.PopIn asChild>
      <AnimatedCard
        className={mergeClassNames(
          'from-surface-2 to-surface-1 shadow-elevation-strong bg-linear-to-b p-2',
          className,
        )}
        {...rest}
      >
        {children}
      </AnimatedCard>
    </AnimationContainer.PopIn>
  );
}
