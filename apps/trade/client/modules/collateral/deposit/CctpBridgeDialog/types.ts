import { CctpSourceChainId } from 'client/modules/collateral/deposit/CctpBridgeDialog/config';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';
import { Address } from 'viem';

/**
 * Parameters for the CCTP Bridge dialog.
 */
export interface CctpBridgeDialogParams {
  /** User's direct deposit address on Ink chain. */
  directDepositAddress: Address;
  initialProductId: number;
  selectedChainId: CctpSourceChainId;
}

/**
 * Form values for CCTP bridge form.
 * Extends LinkedAmountFractionFormValues for fraction button support.
 */
export interface CctpBridgeFormValues extends LinkedAmountFractionFormValues {
  /** Source chain ID to bridge from. */
  sourceChainId: CctpSourceChainId;
  productId: number;
}

/**
 * Error types for bridge form validation.
 */
export type CctpBridgeErrorType =
  | 'invalid_input'
  | 'below_min'
  | 'max_exceeded';

/**
 * Button state for bridge action.
 * The SDK handles approval internally, so no approval states are needed.
 */
export type CctpBridgeButtonState = BaseActionButtonState;
