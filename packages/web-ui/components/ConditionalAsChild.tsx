import { BaseTestProps, WithRef } from '@nadohq/web-common';
import { Slot, SlotProps } from '@radix-ui/react-slot';
import { createElement, type ElementType } from 'react';

export interface ConditionalAsChildProps
  extends WithRef<SlotProps>, BaseTestProps {
  /** When `true`, the component will use Radix's `Slot` to render `children`. */
  asChild: boolean | undefined;
  /** Can be something like `"div"` or `FallbackComponent`. */
  fallback: ElementType;
}

/**
 * Helper component that either renders `children` directly via Radix's `Slot`
 * (when `asChild` is `true`) or wraps it with the passed in `fallback`.
 *
 * Note, if `children` is not a single node, you need to wrap the child that
 * you want props merged to with Radix's `Slottable`.
 *
 * Uses `createElement` instead of JSX because React 19's stricter `ElementType`
 * typing collapses JSX props to `never` for unparameterized `ElementType` unions.
 * The `ElementType` must remain unparameterized since consumers pass both string
 * tags ("div") and components with incompatible prop shapes (e.g. motion.div).
 */
export function ConditionalAsChild({
  asChild,
  fallback: Fallback,
  dataTestId,
  ...props
}: ConditionalAsChildProps) {
  const Comp = asChild ? Slot : Fallback;

  return createElement(Comp, { ...props, 'data-testid': dataTestId });
}
