import {
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { TABLE_CELL_LEFT_PADDING_CLASSNAME } from 'client/components/DataTable/consts';

export function TablePlaceholder({
  children,
  className,
}: WithChildren<WithClassnames>) {
  return (
    <div
      className={mergeClassNames(
        'h-full w-full py-5 select-none',
        TABLE_CELL_LEFT_PADDING_CLASSNAME,
        'text-text-tertiary text-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
