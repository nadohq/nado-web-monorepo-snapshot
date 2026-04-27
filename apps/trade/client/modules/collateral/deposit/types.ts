import { BigNumber } from 'bignumber.js';
import { CollateralSpotProductSelectValue } from 'client/modules/collateral/types';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { OnChainActionButtonStateWithApproval } from 'client/types/OnChainActionButtonStateWithApproval';

// We do NOT check for max deposit based on user wallet balance because public RPCs can be unreliable, and we do not
/**
 * Error types for deposit operations
 */
export type DepositErrorType =
  | 'invalid_input' // Form input is not valid
  | 'below_min'; // below minimum amount

export interface DepositFormValues extends LinkedAmountFractionFormValues {
  productId: number;
}

export type DepositActionButtonState = OnChainActionButtonStateWithApproval;

export interface DepositProductSelectValue extends CollateralSpotProductSelectValue {
  tokenDecimals: number;
  decimalAdjustedNadoBalance: BigNumber;
  decimalAdjustedWalletBalance: BigNumber | undefined;
  decimalAdjustedMinimumInitialDepositAmount: BigNumber | undefined;
  oraclePrice: BigNumber;
}

export type DepositInfoCardType = 'wrap_weth';
