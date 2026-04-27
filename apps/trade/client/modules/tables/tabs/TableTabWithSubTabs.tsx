import {
  CountIndicator,
  PillTabs,
  ScrollShadowsContainer,
} from '@nadohq/web-ui';
import {
  TabsContent,
  TabsList,
  Root as TabsRoot,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { useSubaccountCountIndicators } from 'client/hooks/subaccount/useSubaccountCountIndicators';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { TradingSubTab } from 'client/modules/trading/layout/types';
import { useCallback } from 'react';

interface Props<T extends string> {
  subTabs: TradingSubTab<T>[];
  // Optional callback to notify parent component of sub-tab changes
  onSelectedSubTabIdChange?: (id: T) => void;
}

/**
 * Generic component for rendering a tab with pill sub-tabs
 * Each sub-tab can optionally provide its own filter component
 */
export function TableTabWithSubTabs<T extends string>({
  subTabs,
  onSelectedSubTabIdChange,
}: Props<T>) {
  const { selectedTabId, setSelectedUntypedTabId, tabs } = useTabs(subTabs);
  const countIndicators = useSubaccountCountIndicators();

  const handleSubTabChange = useCallback(
    (selectedTabId: string) => {
      onSelectedSubTabIdChange?.(selectedTabId as T);
      setSelectedUntypedTabId(selectedTabId);
    },
    [onSelectedSubTabIdChange, setSelectedUntypedTabId],
  );

  return (
    <TabsRoot value={selectedTabId} onValueChange={handleSubTabChange}>
      <TabsList asChild>
        <ScrollShadowsContainer orientation="horizontal">
          <PillTabs.TabsList>
            {tabs.map(({ id, countIndicatorKey, label }) => {
              const associatedCount = countIndicatorKey
                ? countIndicators[countIndicatorKey]
                : undefined;
              const active = selectedTabId === id;
              return (
                <TabsTrigger asChild key={id} value={id}>
                  <PillTabs.Button
                    id={id}
                    active={active}
                    endIcon={
                      <CountIndicator
                        variant="secondary"
                        count={associatedCount}
                      />
                    }
                    dataTestId={`table-sub-tab-trigger-${id}`}
                  >
                    {label}
                  </PillTabs.Button>
                </TabsTrigger>
              );
            })}
          </PillTabs.TabsList>
        </ScrollShadowsContainer>
      </TabsList>
      {tabs.map(({ id, content }) => (
        <TabsContent
          key={id}
          value={id}
          data-testid={`table-sub-tab-content-${id}`}
        >
          {content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}
