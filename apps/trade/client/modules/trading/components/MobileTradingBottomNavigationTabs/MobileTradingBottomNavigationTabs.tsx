import { MarketCategory } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { TabTextButton } from '@nadohq/web-ui';
import {
  TabsContent,
  TabsList,
  Root as TabsRoot,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { useMobileTradingBottomNavigationTabs } from 'client/modules/trading/components/MobileTradingBottomNavigationTabs/hooks/useMobileTradingBottomNavigationTabs';
import { ElementType } from 'react';

interface Props {
  productId: number | undefined;
  OrderPlacement: ElementType<WithClassnames>;
  marketSwitcherDefaultCategory: MarketCategory;
  InfoCards: ElementType<WithClassnames>;
}

export function MobileTradingBottomNavigationTabs({
  productId,
  OrderPlacement,
  marketSwitcherDefaultCategory,
  InfoCards,
}: Props) {
  const mobileTradingBottomNavigationTabs =
    useMobileTradingBottomNavigationTabs({
      productId,
      OrderPlacement,
      marketSwitcherDefaultCategory,
      InfoCards,
    });
  const { selectedTabId, tabs, setSelectedTabId } = useTabs(
    mobileTradingBottomNavigationTabs,
  );

  return (
    <TabsRoot
      className={joinClassNames(
        // h-full to take up the full height of the parent container
        'h-full',
        'flex flex-col overflow-hidden',
      )}
      value={selectedTabId}
      onValueChange={setSelectedTabId}
    >
      {tabs.map(({ id, content }) => (
        <TabsContent
          className={joinClassNames(
            // py- to create spacing from bottom nav tabs & top navbar
            'flex-1 py-1',
            'no-scrollbar overflow-scroll',
            'flex flex-col gap-y-1',
          )}
          value={id}
          key={id}
        >
          {content}
        </TabsContent>
      ))}
      <TabsList
        className={joinClassNames(
          'bg-surface-card',
          'px-8 py-4',
          'flex justify-between gap-x-4',
          'border-overlay-divider border-t',
        )}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <TabsTrigger key={id} asChild value={id}>
            <TabTextButton
              className="text-xs"
              id={id}
              active={selectedTabId === id}
              startIcon={<Icon size={18} />}
            >
              {label}
            </TabTextButton>
          </TabsTrigger>
        ))}
      </TabsList>
    </TabsRoot>
  );
}
