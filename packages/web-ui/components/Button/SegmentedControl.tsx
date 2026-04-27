import { joinClassNames, mergeClassNames, WithRef } from '@nadohq/web-common';
import { ComponentPropsWithRef } from 'react';
import { DistributedOmit } from 'type-fest';
import { SizeVariant } from '../../types';
import { getStateOverlayClassNames } from '../../utils';
import { Button } from './Button';
import {
  STANDARD_BUTTON_HORIZONTAL_PADDING_CLASSNAME,
  STANDARD_BUTTON_TEXT_SIZE_CLASSNAME,
  STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME,
} from './consts';
import { ButtonProps } from './types';

export type SegmentControlButtonProps = DistributedOmit<
  ButtonProps,
  'isLoading'
> & {
  size?: SizeVariant;
  active?: boolean;
};

function SegmentedControlButton({
  className,
  size = 'base',
  active,
  ...rest
}: SegmentControlButtonProps) {
  const stateClassNames = (() => {
    if (active) {
      const activeStateOverlayClassNames = getStateOverlayClassNames({
        borderRadiusVariant: 'xs',
        disabled: false,
        active,
      });

      return joinClassNames('text-text-primary', activeStateOverlayClassNames);
    }
    if (rest.disabled) {
      return 'text-disabled';
    }
    return 'text-text-tertiary hover:text-text-secondary';
  })();

  return (
    <Button
      className={mergeClassNames(
        'flex-1 rounded-xs font-medium whitespace-nowrap',
        'items-center',
        STANDARD_BUTTON_HORIZONTAL_PADDING_CLASSNAME[size],
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME[size],
        STANDARD_BUTTON_TEXT_SIZE_CLASSNAME[size],
        stateClassNames,
        className,
      )}
      {...rest}
    />
  );
}

function SegmentedControlContainer({
  children,
  className,
  ...rest
}: WithRef<ComponentPropsWithRef<'div'>, HTMLDivElement>) {
  return (
    <div
      className={mergeClassNames(
        'bg-surface-1 flex items-stretch gap-x-0.5 rounded-sm p-0.5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export const SegmentedControl = {
  Button: SegmentedControlButton,
  Container: SegmentedControlContainer,
};
