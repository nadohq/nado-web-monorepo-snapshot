import { BigNumber } from 'bignumber.js';
import { CollateralSpotProductSelectValue } from 'client/modules/collateral/types';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';

export type WithdrawErrorType =
  | 'invalid_input' // Form input is not valid
  | 'max_exceeded' // user is trying to withdraw more than they can, even with borrows
  | 'below_min'; // user trying to withdraw less than min

export interface WithdrawFormValues extends LinkedAmountFractionFormValues {
  productId: number;
  enableBorrows: boolean;
}

export interface WithdrawProductSelectValue extends CollateralSpotProductSelectValue {
  oraclePrice: BigNumber;
  tokenDecimals: number;
  decimalAdjustedNadoBalance: BigNumber;
  decimalAdjustedWalletBalance: BigNumber;
  fee: {
    // amount of token
    amount: BigNumber;
    // dollar value for fee amount
    valueUsd: BigNumber;
  };
}
