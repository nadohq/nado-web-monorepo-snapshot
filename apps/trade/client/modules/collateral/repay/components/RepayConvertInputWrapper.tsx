import { WithChildren } from '@nadohq/web-common';
import { ReactNode } from 'react';

export function RepayConvertInputWrapper({
  children,
  labelContent,
}: WithChildren<{ labelContent: ReactNode }>) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="text-text-secondary text-sm">{labelContent}</div>
      <div className="flex flex-col gap-y-1.5">{children}</div>
    </div>
  );
}
