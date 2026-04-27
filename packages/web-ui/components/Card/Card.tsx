import { joinClassNames, mergeClassNames } from '@nadohq/web-common';
import { ComponentPropsWithRef } from 'react';

export const CARD_ROUNDED_CLASSNAMES = 'rounded-xs';

export const CARD_PADDING_CLASSNAMES = {
  box: 'p-3',
  horizontal: 'px-3',
  vertical: 'py-3',
};

export const CARD_CLASSNAMES = joinClassNames(
  'bg-surface-card shadow-elevation-card',
  CARD_ROUNDED_CLASSNAMES,
);

interface Props extends ComponentPropsWithRef<'div'> {}

export function Card({ className, ...divProps }: Props) {
  return (
    <div
      className={mergeClassNames(
        CARD_CLASSNAMES,
        CARD_PADDING_CLASSNAMES.box,
        className,
      )}
      {...divProps}
    />
  );
}
