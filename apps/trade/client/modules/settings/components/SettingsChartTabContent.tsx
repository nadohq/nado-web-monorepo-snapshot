import { ChartMarksSetting } from 'client/modules/settings/components/ChartMarksSetting';
import { OrderbookAnimationsSetting } from 'client/modules/settings/components/OrderbookAnimationsSetting';
import { OrderLinesSetting } from 'client/modules/settings/components/OrderLinesSetting';
import { PositionLinesSetting } from 'client/modules/settings/components/PositionLinesSetting';

/**
 * Chart tab content for the settings dialog.
 * Includes order lines, position lines, chart marks, and orderbook animations settings.
 */
export function SettingsChartTabContent() {
  return (
    <>
      <OrderLinesSetting />
      <PositionLinesSetting />
      <ChartMarksSetting />
      <OrderbookAnimationsSetting />
    </>
  );
}
