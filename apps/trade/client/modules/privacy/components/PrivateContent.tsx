import { BaseTestProps } from '@nadohq/web-common';
import { PrivacyMask } from '@nadohq/web-ui';
import { ComponentPropsWithoutRef } from 'react';

interface Props extends ComponentPropsWithoutRef<'div'>, BaseTestProps {
  isPrivate: boolean;
}

export function PrivateContent({
  children,
  className,
  isPrivate,
  dataTestId,
  ...rest
}: Props) {
  return (
    <div className={className} {...rest} data-testid={dataTestId}>
      <PrivacyMask isMasked={isPrivate}>{children}</PrivacyMask>
    </div>
  );
}
