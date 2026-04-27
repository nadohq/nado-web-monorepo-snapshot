import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { Spinner } from '@nadohq/web-ui';

export function SpinnerContainer({ className }: WithClassnames) {
  return (
    <div
      className={mergeClassNames(
        'flex h-full w-full items-center justify-center py-16',
        className,
      )}
    >
      <Spinner className="text-text-tertiary" />
    </div>
  );
}
