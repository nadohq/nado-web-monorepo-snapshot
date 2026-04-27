import {
  joinClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';

type Props = WithClassnames & WithChildren;

export function NlpOverviewCardTabContent({ children, className }: Props) {
  return (
    <div
      className={joinClassNames(
        'flex h-full flex-col gap-3 text-xs',
        className,
      )}
    >
      {children}
    </div>
  );
}
