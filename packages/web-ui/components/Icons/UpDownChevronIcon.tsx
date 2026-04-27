import { WithClassnames } from '@nadohq/web-common';
import { Icons } from './icons';
import { IconBaseProps } from './types';

interface Props extends IconBaseProps {
  open: boolean;
}

export function UpDownChevronIcon({
  open,
  ...iconProps
}: WithClassnames<Props>) {
  const Icon = open ? Icons.CaretUp : Icons.CaretDown;

  return <Icon {...iconProps} />;
}
