import { WithChildren } from '@nadohq/web-common';
import { SpinnerContainer } from 'client/components/SpinnerContainer';
import {
  EmptyTablePlaceholder,
  EmptyTablePlaceholderType,
} from 'client/modules/tables/EmptyTablePlaceholder';

interface Props extends WithChildren {
  isLoading: boolean;
  hasData: boolean;
  emptyTablePlaceholderType: EmptyTablePlaceholderType;
}

export function MobileDataTabCards({
  isLoading,
  hasData,
  emptyTablePlaceholderType,
  children,
}: Props) {
  if (isLoading) {
    return <SpinnerContainer />;
  }

  if (!hasData) {
    return (
      <EmptyTablePlaceholder
        className="py-3 text-xs"
        type={emptyTablePlaceholderType}
      />
    );
  }

  return <div className="flex flex-col gap-y-2 px-1.5 py-2">{children}</div>;
}
