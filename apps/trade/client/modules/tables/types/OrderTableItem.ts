import { BalanceSide, OrderAppendix } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';

export interface OrderTableItem extends WithDataTableRowId {
  digest: string;
  orderSide: BalanceSide;
  orderPrice: BigNumber;
  orderAppendix: OrderAppendix;
  isMarket: boolean;
  isReduceOnly: boolean;
  isCloseEntirePosition: boolean;
  isIsolated: boolean;
  totalBaseAmount: BigNumber;
  totalBaseSize: BigNumber;
  totalQuoteSize: BigNumber;
}
