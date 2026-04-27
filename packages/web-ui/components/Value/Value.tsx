import {
  BaseTestProps,
  WithChildren,
  WithClassnames,
  mergeClassNames,
} from '@nadohq/web-common';
import { ReactNode } from 'react';
import { SizeVariant } from '../../types';
import { PrivacyMask } from '../PrivacyMask';
import { ValueEndElement } from './ValueEndElement';

export interface ValueProps
  extends BaseTestProps, WithClassnames<WithChildren> {
  sizeVariant?: SizeVariant;
  endElement?: ReactNode;
  endElementClassName?: string;
  isValuePrivate?: boolean;
  onClick?: () => void;
}

export function Value({
  sizeVariant = 'base',
  className,
  children,
  endElement,
  endElementClassName,
  isValuePrivate,
  dataTestId,
  onClick,
}: ValueProps) {
  const textSizeClassName = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg sm:text-xl',
    xl: 'text-2xl sm:text-3xl',
  }[sizeVariant];

  return (
    <div
      className={mergeClassNames(
        textSizeClassName,
        'text-text-primary flex items-baseline gap-x-1',
        onClick && 'cursor-pointer',
        className,
      )}
      data-testid={dataTestId}
      onClick={onClick}
    >
      <PrivacyMask isMasked={!!isValuePrivate}>{children}</PrivacyMask>
      {!!endElement && (
        <ValueEndElement
          sizeVariant={sizeVariant}
          className={endElementClassName}
        >
          {endElement}
        </ValueEndElement>
      )}
    </div>
  );
}
