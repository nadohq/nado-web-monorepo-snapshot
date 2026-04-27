import { Switch } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useEnableTradingPositionLines } from 'client/modules/trading/hooks/useEnableTradingPositionLines';
import { useTranslation } from 'react-i18next';

const TOGGLE_ID = 'trading-position-lines';

export function PositionLinesSetting() {
  const { t } = useTranslation();

  const { enableTradingPositionLines, setEnableTradingPositionLines } =
    useEnableTradingPositionLines();

  return (
    <SettingWithLabel
      definitionId="settingsChartPositionLines"
      labelContent={
        <Switch.Label id={TOGGLE_ID} className="text-text-tertiary">
          {t(($) => $.chartPositionLines)}
        </Switch.Label>
      }
      controlContent={
        <Switch.Toggle
          id={TOGGLE_ID}
          checked={enableTradingPositionLines}
          onCheckedChange={setEnableTradingPositionLines}
        />
      }
    />
  );
}
