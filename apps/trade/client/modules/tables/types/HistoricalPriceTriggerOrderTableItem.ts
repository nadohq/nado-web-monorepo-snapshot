import { PriceTriggerCriteria } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { OrderTableItem } from 'client/modules/tables/types/OrderTableItem';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';
import { TriggerOrderStatusInfo } from 'client/modules/trading/utils/trigger/getTriggerOrderStatusInfo';

export interface HistoricalPriceTriggerOrderTableItem
  extends ProductTableItem, OrderTableItem {
  timeUpdatedMillis: number;
  priceTriggerCriteria: PriceTriggerCriteria;
  filledAvgPrice: BigNumber | undefined;
  filledBaseSize: BigNumber | undefined;
  filledQuoteSize: BigNumber | undefined;
  closedBaseSize: BigNumber | undefined;
  status: TriggerOrderStatusInfo;
}
