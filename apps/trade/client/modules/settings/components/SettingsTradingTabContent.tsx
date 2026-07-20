import { useSizeClass } from '@nadohq/web-ui';
import { useIsEmbeddedWallet } from 'client/context/wagmi/useIsEmbeddedWallet';
import { ClassicDepositUiSetting } from 'client/modules/settings/components/ClassicDepositUiSetting';
import { OneClickTradingSetting } from 'client/modules/settings/components/OneClickTradingSetting';
import { OrderDefaultMarginModeSetting } from 'client/modules/settings/components/OrderDefaultMarginModeSetting';
import { QuickMarketCloseSetting } from 'client/modules/settings/components/QuickMarketCloseSetting';
import { ResetGridLayoutSetting } from 'client/modules/settings/components/ResetGridLayoutSetting';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useTranslation } from 'react-i18next';

/**
 * Trading tab content for the settings dialog.
 * Includes position mode, one-click trading, quick market close, grid layout reset, default margin mode,
 * and the classic-deposit-UI fallback toggle.
 */
export function SettingsTradingTabContent() {
  const { t } = useTranslation();
  const { isMobile } = useSizeClass();
  const isEmbeddedWallet = useIsEmbeddedWallet();

  return (
    <>
      <SettingWithLabel
        labelContent={t(($) => $.positionMode)}
        controlContent={t(($) => $.oneWayMode)}
        definitionId="settingsPositionMode"
      />
      {!isEmbeddedWallet && <OneClickTradingSetting />}
      <QuickMarketCloseSetting />
      {!isMobile && <ResetGridLayoutSetting />}
      <OrderDefaultMarginModeSetting />
      <ClassicDepositUiSetting />
    </>
  );
}
