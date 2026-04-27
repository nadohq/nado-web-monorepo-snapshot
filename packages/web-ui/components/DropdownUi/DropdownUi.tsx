import {
  BaseTestProps,
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { ReactNode } from 'react';
import { Z_INDEX } from '../../consts';
import { BorderRadiusVariant } from '../../types';
import { getStateOverlayClassNames } from '../../utils';
import { AnimationContainer } from '../AnimationContainer/AnimationContainer';
import {
  Button,
  ButtonProps,
  STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME,
} from '../Button';
import { AnimatedCard } from '../Card';
import { UpDownChevronIcon } from '../Icons';

export type DropdownUiTriggerProps = BaseTestProps &
  Pick<
    ButtonProps,
    'endIcon' | 'disabled' | 'startIcon' | 'className' | 'children'
  > & {
    borderRadiusVariant?: BorderRadiusVariant;
    stateClassNameOverrides?: string;
    open?: boolean;
    noDisabledOverlay?: boolean;
    withChevron?: boolean;
  };

function Trigger({
  borderRadiusVariant = 'xs',
  stateClassNameOverrides,
  disabled,
  className,
  open,
  noDisabledOverlay,
  withChevron,
  endIcon,
  dataTestId,
  ...rest
}: DropdownUiTriggerProps) {
  const hoverStateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant,
    stateClassNameOverrides,
    active: open,
    disabled: !noDisabledOverlay && disabled,
  });

  const roundedClassName = {
    none: '',
    sm: 'rounded-sm',
    xs: 'rounded-xs',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[borderRadiusVariant];

  return (
    <Button
      className={mergeClassNames(
        'flex items-center justify-between gap-x-2 px-2',
        'text-xs',
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME['xs'],
        hoverStateOverlayClassNames,
        roundedClassName,
        className,
      )}
      disabled={disabled}
      endIcon={
        withChevron ? <UpDownChevronIcon open={open ?? false} /> : endIcon
      }
      dataTestId={dataTestId}
      {...rest}
    />
  );
}

function PillTrigger({
  className,
  ...rest
}: Omit<DropdownUiTriggerProps, 'borderRadiusVariant'>) {
  return (
    <Trigger
      className={mergeClassNames(
        'bg-surface-3 relative justify-between rounded-full',
        'text-text-primary px-3 py-2 text-xs',
        className,
      )}
      borderRadiusVariant="full"
      {...rest}
    />
  );
}

export interface ContentProps extends WithChildren<WithClassnames> {
  header?: ReactNode;
}

function Content({ className, children, header, ...rest }: ContentProps) {
  return (
    <AnimationContainer.PopIn asChild>
      <AnimatedCard
        className={mergeClassNames(
          // gap-y- helps maintaining sensible touch targets on mobile
          // but isn't necessary on desktop
          'flex flex-col gap-y-3 lg:gap-y-0.5',
          'bg-surface-2 p-1',
          'shadow-elevation-strong',
          Z_INDEX.popover,
          className,
        )}
        {...rest}
      >
        {header}
        {children}
      </AnimatedCard>
    </AnimationContainer.PopIn>
  );
}

export type DropdownUiItemProps = Exclude<ButtonProps, 'value'> &
  BaseTestProps & {
    active?: boolean;
  };

function Item({
  className,
  disabled,
  active,
  dataTestId,
  ...rest
}: DropdownUiItemProps) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'none',
    stateClassNameOverrides: joinClassNames(
      // Apply hover state overlay when item is highlighted via keyboard nav. ie. DropdownMenu/Select
      'data-[highlighted]:before:bg-overlay-hover',
    ),
    active,
  });

  return (
    <Button
      className={mergeClassNames(
        'flex items-center justify-stretch gap-x-2',
        'rounded-xs p-2 select-none',
        'text-text-secondary text-xs',
        // Apply active color via inherent `state` attribute.
        // This is relevant in `Select` & `DropdownMenu` components.
        'data-[state=checked]:text-text-primary',
        // Apply disabled state via text color instead of overlay.
        disabled ? 'text-disabled' : stateOverlayClassNames,
        className,
      )}
      disabled={disabled}
      dataTestId={dataTestId}
      {...rest}
    />
  );
}

export const DropdownUi = {
  Trigger,
  PillTrigger,
  Content,
  Item,
};
