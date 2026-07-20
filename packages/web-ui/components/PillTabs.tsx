import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithRef,
} from '@nadohq/web-common';
import { ComponentPropsWithRef } from 'react';
import { DistributedOmit } from 'type-fest';
import { getStateOverlayClassNames } from '../utils/stateOverlay/getStateOverlayClassNames';
import { Button } from './Button/Button';
import { STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME } from './Button/consts';
import { ButtonProps } from './Button/types';
import { CARD_PADDING_CLASSNAMES } from './Card';

export type PillTabButtonProps = DistributedOmit<ButtonProps, 'isLoading'> & {
  active?: boolean;
  sizeVariant: 'sm' | 'xs';
  dataTestId?: string;
};

function PillTabButton({
  id,
  className,
  active,
  sizeVariant,
  children,
  ...rest
}: WithChildren<PillTabButtonProps>) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'sm',
    disabled: rest.disabled,
    active,
  });

  const sizeClassNames = {
    sm: 'text-sm',
    xs: 'text-xs',
  }[sizeVariant];

  return (
    <Button
      id={id}
      className={mergeClassNames(
        'px-2.5',
        sizeClassNames,
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME['xs'],
        active
          ? 'bg-surface-2 text-text-primary rounded-md'
          : 'text-text-tertiary',
        stateOverlayClassNames,
        className,
      )}
      {...rest}
    >
      {children}
    </Button>
  );
}

function TabsList({
  children,
  ...rest
}: WithChildren & WithRef<ComponentPropsWithRef<'div'>, HTMLDivElement>) {
  return (
    <div
      className={joinClassNames(
        'flex gap-x-3',
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME['sm'],
        CARD_PADDING_CLASSNAMES.horizontal,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export const PillTabs = {
  Button: PillTabButton,
  TabsList,
};
