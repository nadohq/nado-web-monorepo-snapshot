import { Token } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';

export type CollateralEvent =
  | DepositCollateralEvent
  | TransferCollateralEvent
  | WithdrawCollateralEvent;

export interface BaseCollateralEvent extends WithDataTableRowId {
  timestampMillis: number;
  submissionIndex: string;
  productId: number;
  token: Token;
  amount: BigNumber;
  size: BigNumber;
  valueUsd: BigNumber;
}

export interface DepositCollateralEvent extends BaseCollateralEvent {
  eventType: 'deposit_collateral';
}

export interface TransferCollateralEvent extends BaseCollateralEvent {
  eventType: 'transfer_quote';
  fromSubaccount: SubaccountNames;
  toSubaccount: SubaccountNames;
}

interface SubaccountNames {
  name: string;
  username: string;
}

export interface WithdrawCollateralEvent extends BaseCollateralEvent {
  eventType: 'withdraw_collateral';
  isProcessing: boolean | undefined;
  hasWithdrawPoolLiquidity: boolean;
}
