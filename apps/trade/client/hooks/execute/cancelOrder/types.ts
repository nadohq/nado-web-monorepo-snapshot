import {
  AsyncResult,
  EngineServerExecuteResult,
  TriggerServerExecuteResult,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { OrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';

export interface CancellableOrder {
  productId: number;
  digest: string;
  isTrigger: boolean;
}

export interface CancellableOrderWithNotificationInfo extends CancellableOrder {
  decimalAdjustedTotalAmount: BigNumber;
  orderDisplayType: OrderDisplayType;
}

export interface CancelOrdersParams {
  orders: CancellableOrder[];
}

export interface CancelOrdersWithNotificationParams {
  orders: CancellableOrderWithNotificationInfo[];
}

export interface CancelOrdersResult {
  // Whether these are populated depends on the type of the order being cancelled
  engine?: AsyncResult<EngineServerExecuteResult, unknown>;
  trigger?: AsyncResult<TriggerServerExecuteResult, unknown>;
}
