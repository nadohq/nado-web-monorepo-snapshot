import { Usdt0SourceChainId } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { OnChainActionButtonStateWithApproval } from 'client/types/OnChainActionButtonStateWithApproval';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { Address } from 'viem';

/**
 * Dialog params for USDT0 bridge dialog.
 */
export interface Usdt0BridgeDialogParams {
  /** User's direct deposit address on Ink chain. */
  directDepositAddress: Address;
  initialProductId: number;
  selectedChainId: Usdt0SourceChainId;
}

/**
 * Form values for USDT0 bridge form.
 */
export interface Usdt0BridgeFormValues extends LinkedAmountFractionFormValues {
  /** Source chain ID to bridge from. */
  sourceChainId: Usdt0SourceChainId;
  productId: number;
}

/**
 * Error types for bridge form validation.
 */
export type Usdt0BridgeErrorType =
  | 'invalid_input'
  | 'below_min'
  | 'max_exceeded';

/**
 * Button state for bridge action.
 */
export type Usdt0BridgeButtonState = OnChainActionButtonStateWithApproval;
