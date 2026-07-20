import { BigNumber } from 'bignumber.js';
import { CollateralSpotProductSelectValue } from 'client/modules/collateral/types';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';

export type WithdrawErrorType =
  | 'invalid_input' // Form input is not valid
  | 'max_exceeded' // user is trying to withdraw more than they can, even with borrows
  | 'below_min' // user trying to withdraw less than min
  | 'invalid_address'; // recipient is not a valid address

export interface WithdrawFormValues extends LinkedAmountFractionFormValues {
  productId: number;
  enableBorrows: boolean;
  /**
   * Custom recipient address for the withdrawal. An empty string sends funds to
   * the subaccount owner.
   */
  withdrawAddress: string;
}

export interface WithdrawProductSelectValue extends CollateralSpotProductSelectValue {
  oraclePrice: BigNumber;
  tokenDecimals: number;
  /**
   * Nado balance in the raw xStocks space - i.e. the underlying wrapped balance amount
   */
  decimalAdjustedRawNadoBalance: BigNumber;
  decimalAdjustedWalletBalance: BigNumber;
  fee: {
    // amount of token
    amount: BigNumber;
    // dollar value for fee amount
    valueUsd: BigNumber;
  };
}
