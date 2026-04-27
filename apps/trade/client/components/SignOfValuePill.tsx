import { signDependentValue } from '@nadohq/react-client';
import { WithClassnames, joinClassNames } from '@nadohq/web-common';
import { Icons } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';

interface Props {
  value: BigNumber | undefined;
}

export function SignOfValuePill({ value, className }: WithClassnames<Props>) {
  return (
    <div
      className={joinClassNames(
        'flex h-3.5 w-3.5 items-center justify-center rounded-sm',
        signDependentValue(value, {
          positive: 'text-positive bg-positive-muted',
          negative: 'text-negative bg-negative-muted',
          zero: 'bg-surface-3 text-text-tertiary',
        }),
        className,
      )}
    >
      {signDependentValue(value, {
        positive: <Icons.Plus />,
        negative: <Icons.Minus />,
        zero: <Icons.Dot />,
      })}
    </div>
  );
}
