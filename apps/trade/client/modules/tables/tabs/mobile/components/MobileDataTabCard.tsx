import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { Card, UpDownChevronIcon } from '@nadohq/web-ui';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ReactNode, useState } from 'react';

/**
 * A typical MobileTabCard follows the following structure:
 *  Container
 *    Header
 *    Body
 *      PrimaryContent
 *      Cols3 or Cols2
 */
function Container({ children, className }: WithClassnames<WithChildren>) {
  return (
    <Card
      className={joinClassNames(
        'flex flex-col',
        'gap-y-5 px-0',
        'bg-surface-1',
        className,
      )}
    >
      {children}
    </Card>
  );
}

function Header({ children, className }: WithChildren<WithClassnames>) {
  return (
    <div
      className={mergeClassNames(
        'flex items-start justify-between px-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Body({ children }: WithChildren) {
  return <div className="flex flex-col gap-y-4 px-3">{children}</div>;
}

function Cols3({ children }: WithChildren) {
  return <div className="grid grid-cols-3 gap-4">{children}</div>;
}

interface Cols2Props extends WithChildren, WithClassnames {
  collapsibleContent?: ReactNode;
}

function Cols2({ children, className, collapsibleContent }: Cols2Props) {
  const [showMore, setShowMore] = useState(false);
  const containerClassName = joinClassNames(
    'grid grid-cols-2 gap-3',
    className,
  );

  if (!collapsibleContent) {
    return <div className={containerClassName}>{children}</div>;
  }

  return (
    <Collapsible.Root open={showMore} onOpenChange={setShowMore}>
      <div className={containerClassName}>
        {children}
        {/* `display: contents` to 'detach' from the grid so Content behaves like a Fragment */}
        <Collapsible.Content className="contents">
          {collapsibleContent}
        </Collapsible.Content>
        <Collapsible.Trigger className="col-span-2 flex justify-center">
          <UpDownChevronIcon open={showMore} />
        </Collapsible.Trigger>
      </div>
    </Collapsible.Root>
  );
}

export const MobileDataTabCard = {
  Container,
  Header,
  Body,
  Cols3,
  Cols2,
};
