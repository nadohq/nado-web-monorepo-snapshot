import { MotionProps } from 'motion/react';
import { ComponentProps, ElementType } from 'react';

export type BaseAnimationContainerProps<
  TProps = {},
  TElement extends ElementType = 'div',
> = TProps &
  ComponentProps<TElement> & {
    /**
     * When `true`, the component will use Radix's `Slot` to render `children` directly.
     * When falsy, the component will wrap `children` in a `motion.div`.
     */
    asChild?: boolean;
    fallback?: ElementType;
  };

export type AnimationProps = Pick<
  MotionProps,
  'initial' | 'animate' | 'exit' | 'transition' | 'layout'
>;

export interface TransitionProps {
  /** The duration of the animation */
  duration?: number;
  /** The delay of the animation */
  delay?: number;
}
