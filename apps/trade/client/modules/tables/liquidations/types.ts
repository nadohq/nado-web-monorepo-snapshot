import { NumberFormatSpecifier } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';

export type LiquidatedBalanceType = 'spot' | 'perp';

export interface LiquidatedBalance {
  productId: number;
  productName: string;
  isIsolated: boolean | undefined;
  symbol: string;

  oraclePrice: BigNumber;
  priceFormatSpecifier: NumberFormatSpecifier | string;
  sizeFormatSpecifier: NumberFormatSpecifier | string;
  // For position changes
  signedSizeFormatSpecifier: NumberFormatSpecifier | string;
  // Decimal adjusted
  amountLiquidated: BigNumber;
  liquidatedValueUsd: BigNumber;
  liquidatedBalanceType: LiquidatedBalanceType;
}

export interface LiquidationEventsTableItem extends WithDataTableRowId {
  submissionIndex: string;
  quoteBalanceDelta: BigNumber;
  timestampMillis: number;
  spot?: LiquidatedBalance;
  perp?: LiquidatedBalance;
  liquidatedBalanceTypes: LiquidatedBalanceType[];
}
