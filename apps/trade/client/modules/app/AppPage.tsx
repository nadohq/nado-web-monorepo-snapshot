import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { APP_PAGE_PADDING } from 'client/modules/app/consts/padding';
import { ReactNode } from 'react';

interface HeaderProps {
  title: ReactNode;
  description?: ReactNode;
}

function Header({
  title,
  description,
  className,
}: WithClassnames<HeaderProps>) {
  return (
    <div className={joinClassNames('flex flex-col gap-y-3', className)}>
      <h1 className="text-text-primary text-xl font-medium lg:text-3xl">
        {title}
      </h1>
      {description && (
        <div className="text-text-tertiary text-xs leading-normal lg:text-sm">
          {description}
        </div>
      )}
    </div>
  );
}

function Content({ className, children }: WithChildren<WithClassnames>) {
  return (
    <div
      className={mergeClassNames(
        // `box-content` so we can add padding while keeping our widths aligned with Figma.
        'mx-auto box-content flex max-w-400 flex-col gap-y-4 lg:gap-y-6',
        APP_PAGE_PADDING.horizontal,
        APP_PAGE_PADDING.vertical,
        className,
      )}
    >
      {children}
    </div>
  );
}

export const AppPage = {
  Header,
  Content,
};
