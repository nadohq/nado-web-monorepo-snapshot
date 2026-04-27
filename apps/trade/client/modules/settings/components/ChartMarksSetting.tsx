import { Switch } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useEnableChartMarks } from 'client/modules/trading/hooks/useEnableChartMarks';
import { useTranslation } from 'react-i18next';

const TOGGLE_ID = 'trading-chart-marks';

export function ChartMarksSetting() {
  const { t } = useTranslation();

  const { enableChartMarks, setEnableChartMarks } = useEnableChartMarks();

  return (
    <SettingWithLabel
      labelContent={
        <Switch.Label id={TOGGLE_ID} className="text-text-tertiary">
          {t(($) => $.chartBuySellMarks)}
        </Switch.Label>
      }
      controlContent={
        <Switch.Toggle
          id={TOGGLE_ID}
          checked={enableChartMarks}
          onCheckedChange={setEnableChartMarks}
        />
      }
    />
  );
}
