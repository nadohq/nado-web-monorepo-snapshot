import { OrderSlippageSettings } from 'client/modules/settings/components/OrderSlippageSettings/OrderSlippageSettings';
import { SettingsChartTabContent } from 'client/modules/settings/components/SettingsChartTabContent';
import { SettingsNotificationsTabContent } from 'client/modules/settings/components/SettingsNotificationsTabContent';
import { SettingsTradingTabContent } from 'client/modules/settings/components/SettingsTradingTabContent';
import { SettingsTab } from 'client/modules/settings/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useSettingsTabs(): SettingsTab[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        id: 'trading',
        label: t(($) => $.trading),
        content: <SettingsTradingTabContent />,
      },
      {
        id: 'slippage',
        label: t(($) => $.slippage),
        content: <OrderSlippageSettings />,
      },
      {
        id: 'chart',
        label: t(($) => $.chart),
        content: <SettingsChartTabContent />,
      },
      {
        id: 'notifications',
        label: t(($) => $.tabs.notifications),
        content: <SettingsNotificationsTabContent />,
      },
    ],
    [t],
  );
}
