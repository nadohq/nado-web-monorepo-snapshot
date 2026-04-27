import { Switch } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useEnableTradingOrderLines } from 'client/modules/trading/hooks/useEnableTradingOrderLines';
import { useTranslation } from 'react-i18next';

const TOGGLE_ID = 'trading-order-lines';

export function OrderLinesSetting() {
  const { t } = useTranslation();

  const { enableTradingOrderLines, setEnableTradingOrderLines } =
    useEnableTradingOrderLines();

  return (
    <SettingWithLabel
      definitionId="settingsChartOrderLines"
      labelContent={
        <Switch.Label id={TOGGLE_ID} className="text-text-tertiary">
          {t(($) => $.chartOrderLines)}
        </Switch.Label>
      }
      controlContent={
        <Switch.Toggle
          id={TOGGLE_ID}
          checked={enableTradingOrderLines}
          onCheckedChange={setEnableTradingOrderLines}
        />
      }
    />
  );
}
