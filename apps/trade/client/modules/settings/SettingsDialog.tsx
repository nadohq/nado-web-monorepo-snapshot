import { joinClassNames } from '@nadohq/web-common';
import { DIALOG_HORIZONTAL_PADDING, UnderlinedTabs } from '@nadohq/web-ui';
import {
  TabsContent,
  TabsList,
  Root as TabsRoot,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useSettingsTabs } from 'client/modules/settings/hooks/useSettingsTabs';
import { SettingsTab } from 'client/modules/settings/types';
import { useTranslation } from 'react-i18next';

/**
 * Settings dialog component that displays application settings organized in tabs.
 * Includes trading preferences, slippage settings, chart options, and notifications.
 * @returns The settings dialog component
 */
export function SettingsDialog() {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const settingsTabs = useSettingsTabs();
  const { tabs, selectedTabId, setSelectedUntypedTabId } =
    useTabs(settingsTabs);

  return (
    <BaseAppDialog.Container onClose={hide}>
      {/* Remove title border — tab list renders its own bottom border */}
      <BaseAppDialog.Title onClose={hide} className="border-b-0">
        {t(($) => $.dialogTitles.settings)}
      </BaseAppDialog.Title>
      <TabsRoot value={selectedTabId} onValueChange={setSelectedUntypedTabId}>
        <BaseAppDialog.Body className="min-h-65 p-0">
          <SettingsTabsList tabs={tabs} selectedTabId={selectedTabId} />
          {tabs.map(({ id, content }) => (
            <TabsContent
              key={id}
              value={id}
              className={joinClassNames(
                'flex flex-col gap-y-2',
                DIALOG_HORIZONTAL_PADDING,
              )}
            >
              {content}
            </TabsContent>
          ))}
        </BaseAppDialog.Body>
      </TabsRoot>
    </BaseAppDialog.Container>
  );
}

interface SettingsTabsListProps {
  tabs: Readonly<SettingsTab[]>;
  selectedTabId: string;
}

function SettingsTabsList({ tabs, selectedTabId }: SettingsTabsListProps) {
  return (
    <TabsList
      className={joinClassNames(
        'border-overlay-divider flex items-center gap-x-6 border-b',
        DIALOG_HORIZONTAL_PADDING,
      )}
    >
      {tabs.map(({ id, label }) => (
        <TabsTrigger asChild value={id} key={id}>
          <UnderlinedTabs.Button
            active={selectedTabId === id}
            className="text-xs"
          >
            {label}
          </UnderlinedTabs.Button>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
