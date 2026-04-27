import {
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';

export function ErrorPanel({
  children,
  className,
}: WithChildren<WithClassnames>) {
  return (
    <div
      className={mergeClassNames(
        'flex flex-col items-start gap-y-1.5',
        'rounded-sm px-3 py-2',
        'text-text-secondary text-xs',
        'bg-negative-muted',
        // error panel content is usually multi-line, so we use normal line height
        'leading-normal',
        className,
      )}
    >
      {children}
    </div>
  );
}
