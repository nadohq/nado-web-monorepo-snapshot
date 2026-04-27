import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { memo } from 'react';

function Item({ className, children }: WithClassnames<WithChildren>) {
  return (
    <div
      className={joinClassNames(
        'text-text-tertiary text-3xs flex flex-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Container({ className, children }: WithChildren<WithClassnames>) {
  return (
    <div
      className={mergeClassNames('flex gap-x-1 px-3 pt-1.5 pb-2.5', className)}
    >
      {children}
    </div>
  );
}

export const MarketOrdersHeaderRow = {
  Container: memo(Container),
  Item: memo(Item),
};
