import { BigNumber } from 'bignumber.js';
import { CancellableOrderWithNotificationInfo } from 'client/hooks/execute/cancelOrder/types';
import { CancellableOrderTableItem } from 'client/modules/tables/types/CancellableOrderTableItem';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';
import { TriggerOrderStatusInfo } from 'client/modules/trading/utils/trigger/getTriggerOrderStatusInfo';

/**
 * Table item data structure for time-based trigger orders (TWAP orders)
 */
export interface OpenTimeTriggerOrderTableItem
  extends ProductTableItem, CancellableOrderTableItem {
  timePlacedMillis: number;
  filledAvgPrice: BigNumber | undefined;
  filledBaseSize: BigNumber | undefined;
  totalBaseSize: BigNumber;
  status: TriggerOrderStatusInfo;
  frequencyInMillis: number;
  totalRuntimeInMillis: number;
  orderForCancellation: CancellableOrderWithNotificationInfo;
}
