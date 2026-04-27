import {
  joinClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { Card } from '@nadohq/web-ui';

export function TradingPageCard({
  children,
  className,
}: WithChildren<WithClassnames>) {
  return <Card className={joinClassNames('p-0', className)}>{children}</Card>;
}
