import {
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import {
  CountIndicator,
  ScrollShadowsContainer,
  UnderlinedTabs,
} from '@nadohq/web-ui';
import { TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { TabIdentifiable } from 'client/hooks/ui/tabs/types';

interface Props<TTabID extends string>
  extends WithChildren, TabIdentifiable<TTabID> {
  active: boolean;
  associatedCount?: number;
}

function TableTabsTabsList({
  children,
  className,
}: WithClassnames<WithChildren>) {
  return (
    <TabsList asChild>
      <ScrollShadowsContainer
        orientation="horizontal"
        className={mergeClassNames(
          'flex items-center gap-x-6 whitespace-nowrap',
          className,
        )}
      >
        {children}
      </ScrollShadowsContainer>
    </TabsList>
  );
}

function TableTabsTabsTrigger<TTabID extends string>({
  active,
  id,
  children,
  associatedCount,
}: Props<TTabID>) {
  return (
    <TabsTrigger asChild value={id}>
      <UnderlinedTabs.Button
        dataTestId={`table-tabs-trigger-${id}`}
        active={active}
        endIcon={<CountIndicator variant="primary" count={associatedCount} />}
      >
        {children}
      </UnderlinedTabs.Button>
    </TabsTrigger>
  );
}

export const TableTabs = {
  TabsList: TableTabsTabsList,
  TabsTrigger: TableTabsTabsTrigger,
};
