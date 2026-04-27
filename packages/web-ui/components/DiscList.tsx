import {
  joinClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';

function DiscListContainer({
  children,
  className,
}: WithChildren<WithClassnames>) {
  return (
    <ul
      className={joinClassNames(
        'flex list-outside list-disc flex-col gap-y-1 pl-4',
        // each item can be multi-line so we use leading-normal on container
        'leading-normal',
        className,
      )}
    >
      {children}
    </ul>
  );
}

function DiscListItem({ children, className }: WithChildren<WithClassnames>) {
  return <li className={className}>{children}</li>;
}

export const DiscList = {
  Container: DiscListContainer,
  Item: DiscListItem,
};
