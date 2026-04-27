import {
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';

export function StatsSection({
  children,
  className,
}: WithClassnames<WithChildren>) {
  return (
    <div className={mergeClassNames('grid grid-cols-1 gap-6', className)}>
      {children}
    </div>
  );
}
