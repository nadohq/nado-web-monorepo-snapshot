import {
  BaseTestProps,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { MouseEventHandler } from 'react';

export interface TableCellProps
  extends WithChildren, WithClassnames, BaseTestProps {
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function TableCell({
  className,
  children,
  onClick,
  dataTestId,
}: TableCellProps) {
  return (
    <div
      className={mergeClassNames(
        'text-text-primary text-xs whitespace-nowrap',
        'flex h-full items-center',
        className,
      )}
      onClick={onClick}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}
