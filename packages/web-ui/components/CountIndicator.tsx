import { joinClassNames, WithClassnames } from '@nadohq/web-common';

interface Props extends WithClassnames {
  /**
   * Use `secondary` when the count represents a subset of a `primary` count.
   */
  variant: 'primary' | 'secondary';
  count: number | undefined;
}

export function CountIndicator({ variant, count, className }: Props) {
  if (count === undefined || count === 0) {
    return;
  }

  switch (variant) {
    case 'primary':
      return (
        <div
          className={joinClassNames(
            // -my- to cancel layout shift due to py padding so that pill
            // stays inline within line height
            'bg-surface-3 text-3xs text-text-primary -my-1 px-1.5 py-1',
            'rounded-sm whitespace-nowrap',
            className,
          )}
        >
          {count.toFixed()}
        </div>
      );
    case 'secondary':
      return <span>({count.toFixed()})</span>;
  }
}
