import { BigNumber } from 'bignumber.js';
import { OrderTableItem } from 'client/modules/tables/types/OrderTableItem';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';
import { TriggerOrderStatusInfo } from 'client/modules/trading/utils/trigger/getTriggerOrderStatusInfo';

export interface HistoricalTimeTriggerOrdersTableItem
  extends ProductTableItem, OrderTableItem {
  timeUpdatedMillis: number;
  filledAvgPrice: BigNumber | undefined;
  filledBaseSize: BigNumber | undefined;
  closedBaseSize: BigNumber | undefined;
  status: TriggerOrderStatusInfo;
  frequencyInMillis: number;
  totalRuntimeInMillis: number;
}
