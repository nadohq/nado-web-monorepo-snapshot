import { CancellableOrderWithNotificationInfo } from 'client/hooks/execute/cancelOrder/types';
import { OrderTableItem } from 'client/modules/tables/types/OrderTableItem';

export interface CancellableOrderTableItem extends OrderTableItem {
  orderForCancellation: CancellableOrderWithNotificationInfo;
}
