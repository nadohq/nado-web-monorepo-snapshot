import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { ReactNode } from 'react';

export interface StackedValuesProps extends WithClassnames {
  withSeparator?: boolean;
  top: ReactNode;
  bottom: ReactNode;
}

export function StackedValues({
  className,
  withSeparator,
  top,
  bottom,
}: StackedValuesProps) {
  return (
    <div className={mergeClassNames('flex flex-col gap-y-1.5', className)}>
      <div className="text-text-primary flex items-baseline">
        <div>{top}</div> {withSeparator && <span>&nbsp;/</span>}
      </div>
      <div className="text-text-tertiary">{bottom}</div>
    </div>
  );
}
