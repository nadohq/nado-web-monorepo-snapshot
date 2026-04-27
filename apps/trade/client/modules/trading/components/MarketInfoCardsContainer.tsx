import {
  WithChildren,
  WithClassnames,
  joinClassNames,
} from '@nadohq/web-common';
import { ScrollShadowsContainer } from '@nadohq/web-ui';

export function MarketInfoCardsContainer({
  className,
  children,
}: WithClassnames<WithChildren>) {
  return (
    <ScrollShadowsContainer
      orientation="horizontal"
      className={joinClassNames('flex items-center gap-x-1.5 p-2', className)}
    >
      {children}
    </ScrollShadowsContainer>
  );
}
