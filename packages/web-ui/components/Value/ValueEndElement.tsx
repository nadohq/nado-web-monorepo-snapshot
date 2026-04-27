import {
  BaseTestProps,
  WithChildren,
  WithClassnames,
  mergeClassNames,
} from '@nadohq/web-common';
import { SizeVariant } from '../../types';

interface ValueEndElementProps extends BaseTestProps, WithClassnames {
  sizeVariant?: SizeVariant;
}

export function ValueEndElement({
  children,
  sizeVariant = 'base',
  className,
  dataTestId,
}: WithChildren<ValueEndElementProps>) {
  const endElementSizeClassNames = {
    xs: 'text-xs',
    sm: 'text-xs',
    base: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  }[sizeVariant];

  // Line-height has no effect on inline elements such as `span`, so we wrap children in a `div` here for consistency
  // https://stackoverflow.com/questions/20103076/why-line-height-is-ignored-in-a-span-tag-and-works-in-div-tag
  return (
    <div
      className={mergeClassNames(endElementSizeClassNames, className)}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}
