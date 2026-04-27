import { BaseTestProps } from '@nadohq/web-common';
import { Icons } from './icons';
import { IconBaseProps } from './types';

interface Props extends IconBaseProps, BaseTestProps {
  isCopied: boolean;
}

export function CopyIcon({ isCopied, dataTestId, ...iconProps }: Props) {
  const Icon = isCopied ? Icons.Check : Icons.Copy;
  return <Icon {...iconProps} data-testid={dataTestId} />;
}
