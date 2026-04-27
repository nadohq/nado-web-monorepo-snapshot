import { useIsMobile } from '@nadohq/web-ui';
import { OneClickTradingSetting } from 'client/modules/settings/components/OneClickTradingSetting';
import { OrderDefaultMarginModeSetting } from 'client/modules/settings/components/OrderDefaultMarginModeSetting';
import { QuickMarketCloseSetting } from 'client/modules/settings/components/QuickMarketCloseSetting';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { TradingConsolePositionSetting } from 'client/modules/settings/components/TradingConsolePositionSetting';
import { useTranslation } from 'react-i18next';

/**
 * Trading tab content for the settings dialog.
 * Includes position mode, one-click trading, quick market close, console position, and default margin mode settings.
 */
export function SettingsTradingTabContent() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <>
      <SettingWithLabel
        labelContent={t(($) => $.positionMode)}
        controlContent={t(($) => $.oneWayMode)}
        definitionId="settingsPositionMode"
      />
      <OneClickTradingSetting />
      <QuickMarketCloseSetting />
      {!isMobile && <TradingConsolePositionSetting />}
      <OrderDefaultMarginModeSetting />
    </>
  );
}
