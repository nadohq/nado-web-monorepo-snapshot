import { Switch } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useEnableTradingNotifications } from 'client/modules/trading/hooks/useEnableTradingNotifications';
import { useTranslation } from 'react-i18next';

const TOGGLE_ID = 'trading-notifs';

export function OrderNotificationsSetting() {
  const { t } = useTranslation();

  const { enableTradingNotifications, setEnableTradingNotifications } =
    useEnableTradingNotifications();

  return (
    <SettingWithLabel
      definitionId="settingsOrderNotifications"
      labelContent={
        <Switch.Label id={TOGGLE_ID} className="text-text-tertiary">
          {t(($) => $.orderNotifications)}
        </Switch.Label>
      }
      controlContent={
        <Switch.Toggle
          id={TOGGLE_ID}
          checked={enableTradingNotifications}
          onCheckedChange={setEnableTradingNotifications}
        />
      }
    />
  );
}
