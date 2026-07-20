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

export type DepositCollateralEvent = BaseCollateralEvent;

export interface TransferCollateralEvent extends BaseCollateralEvent {
  fromSubaccount: SubaccountNames;
  toSubaccount: SubaccountNames;
}

interface SubaccountNames {
  name: string;
  username: string;
}

export interface WithdrawCollateralEvent extends BaseCollateralEvent {
  isProcessing: boolean | undefined;
  hasWithdrawPoolLiquidity: boolean;
  // Recipient of the withdrawal. The subaccount owner unless a custom address
  // was specified via a `withdraw_collateral_v2` withdrawal.
  recipientAddress: string;
}
