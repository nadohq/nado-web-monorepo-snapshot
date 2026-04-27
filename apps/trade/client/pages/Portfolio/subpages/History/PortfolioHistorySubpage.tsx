'use client';

import { SecondaryButton, SectionedCard } from '@nadohq/web-ui';
import { TabsContent, Root as TabsRoot } from '@radix-ui/react-tabs';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { TableTabs } from 'client/modules/tables/tabs/TableTabs';
import { usePortfolioHistoryTabs } from 'client/pages/Portfolio/subpages/History/hooks/usePortfolioHistoryTabs';
import { useTranslation } from 'react-i18next';

export function PortfolioHistorySubpage() {
  const { t } = useTranslation();

  const { show } = useDialog();
  const { tabs, selectedTabId, setSelectedUntypedTabId, selectedExportType } =
    usePortfolioHistoryTabs();

  return (
    <TabsRoot
      asChild
      value={selectedTabId}
      onValueChange={(value) => {
        setSelectedUntypedTabId(value);
      }}
    >
      <SectionedCard className="pb-3">
        <SectionedCard.Header className="flex items-center gap-x-2 py-0">
          <TableTabs.TabsList className="flex-1">
            {tabs.map(({ id, label }) => (
              <TableTabs.TabsTrigger
                key={id}
                id={id}
                active={selectedTabId === id}
              >
                {label}
              </TableTabs.TabsTrigger>
            ))}
          </TableTabs.TabsList>
          <div className="flex gap-x-1">
            <SecondaryButton
              size="xs"
              onClick={() =>
                show({
                  type: 'export_history',
                  params: {
                    initialExportType: selectedExportType,
                  },
                })
              }
            >
              {t(($) => $.buttons.export)}
            </SecondaryButton>
          </div>
        </SectionedCard.Header>
        <SectionedCard.Content className="p-0">
          {tabs.map(({ id, content }) => (
            <TabsContent key={id} value={id}>
              {content}
            </TabsContent>
          ))}
        </SectionedCard.Content>
      </SectionedCard>
    </TabsRoot>
  );
}
