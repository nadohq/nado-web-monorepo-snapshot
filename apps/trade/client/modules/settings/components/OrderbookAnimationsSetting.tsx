import { Switch } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useEnableTradingOrderbookAnimations } from 'client/modules/trading/hooks/useEnableTradingOrderbookAnimations';
import { useTranslation } from 'react-i18next';

const TOGGLE_ID = 'trading-orderbook-animations';

export function OrderbookAnimationsSetting() {
  const { t } = useTranslation();

  const {
    enableTradingOrderbookAnimations,
    setEnableTradingOrderbookAnimations,
  } = useEnableTradingOrderbookAnimations();

  return (
    <SettingWithLabel
      definitionId="settingsOrderbookAnimations"
      labelContent={
        <Switch.Label id={TOGGLE_ID} className="text-text-tertiary">
          {t(($) => $.orderbookAnimations)}
        </Switch.Label>
      }
      controlContent={
        <Switch.Toggle
          id={TOGGLE_ID}
          checked={enableTradingOrderbookAnimations}
          onCheckedChange={setEnableTradingOrderbookAnimations}
        />
      }
    />
  );
}
