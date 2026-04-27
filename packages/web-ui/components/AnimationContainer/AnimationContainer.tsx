import { BaseTestProps } from '@nadohq/web-common';
import { motion } from 'motion/react';
import { ConditionalAsChild } from '../ConditionalAsChild';
import {
  AnimationProps,
  BaseAnimationContainerProps,
  TransitionProps,
} from './types';

/**
 * A base component that animates a child component.
 * When `asChild` is true, applies motion props directly to the child.
 * When `asChild` is false, wraps children in a `motion.div`.
 */
function BaseAnimationContainer({
  asChild,
  fallback = motion.div,
  dataTestId,
  ...props
}: BaseAnimationContainerProps<AnimationProps> & BaseTestProps) {
  return (
    <ConditionalAsChild
      asChild={asChild}
      fallback={fallback}
      dataTestId={dataTestId}
      {...props}
    />
  );
}

interface PopInProps
  extends BaseAnimationContainerProps<TransitionProps>, BaseTestProps {
  /** The initial "y" offset of the animation */
  initialYOffset?: number;
  /** Whether to disable the initial fade in animation */
  disableFadeIn?: boolean;
}

/** A component that animates by fading in and sliding up. */
function PopIn({
  initialYOffset = 10,
  duration = 0.2,
  delay = 0,
  disableFadeIn,
  dataTestId,
  ...rest
}: PopInProps) {
  return (
    <BaseAnimationContainer
      initial={{ y: initialYOffset, opacity: disableFadeIn ? 1 : 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration, delay }}
      dataTestId={dataTestId}
      {...rest}
    />
  );
}

interface SlideInProps extends BaseAnimationContainerProps<TransitionProps> {
  /** The initial "x" offset of the animation */
  initialXOffset?: number;
  /** The side to slide in from */
  from: 'left' | 'right';
  /**
   * Whether to animate the parent layout of the child.
   * This offers a smoother animation when the layout is directly affected by the animation.
   */
  animateLayout?: AnimationProps['layout'];
  /** Whether to disable the exit animation */
  disableExitAnimation?: boolean;
  /** Whether to animate the exit in the opposite direction of the slide in */
  exitOppositeDirection?: boolean;
}

/** A component that animates by sliding in from the left or right. */
function SlideIn({
  initialXOffset = 20,
  duration = 0.3,
  from,
  delay,
  exitOppositeDirection,
  disableExitAnimation,
  animateLayout,
  ...rest
}: SlideInProps) {
  const offset = from === 'left' ? initialXOffset * -1 : initialXOffset;

  const exitAnimation = disableExitAnimation
    ? undefined
    : {
        x: exitOppositeDirection ? offset * -1 : offset,
        opacity: 0,
      };

  return (
    <BaseAnimationContainer
      initial={{ x: offset, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={exitAnimation}
      transition={{ duration, delay }}
      layout={animateLayout}
      {...rest}
    />
  );
}

export const AnimationContainer = {
  Base: BaseAnimationContainer,
  PopIn,
  SlideIn,
};
