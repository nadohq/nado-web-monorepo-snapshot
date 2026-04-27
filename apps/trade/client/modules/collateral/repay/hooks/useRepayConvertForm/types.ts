import { SubaccountTx } from '@nadohq/client';
import { AnnotatedSpotMarket } from '@nadohq/react-client';
import { InputValidatorFn } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { LatestMarketPrice } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { CollateralSpotProductSelectValue } from 'client/modules/collateral/types';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { UseFormReturn } from 'react-hook-form';

export type RepayConvertAmountInputErrorType =
  | 'invalid_input' // Form input is not valid
  | 'max_exceeded' // Trying to repay more than the max
  | 'invalid_size_increment';

export type RepayConvertFormErrorType =
  | RepayConvertAmountInputErrorType
  | 'not_borrowing' // Invalid repay product (not borrowing this product)
  | 'no_available_source'; // There are no available source products to repay the balance

export interface RepayConvertFormValues {
  // For product being repaid
  repayProductId: number;
  repayAmount: string;
  // Product being sold to repay
  sourceProductId: number | undefined;
}

export interface RepayConvertProductSelectValue extends CollateralSpotProductSelectValue {
  marketName: string;
  // Absolute
  amountBorrowed: BigNumber;
  oraclePrice: BigNumber;
  marketPrices: LatestMarketPrice | undefined;
  decimalAdjustedNadoBalance: BigNumber;
}

export interface UseRepayConvertForm {
  form: UseFormReturn<RepayConvertFormValues>;
  amountInputError: RepayConvertAmountInputErrorType | undefined;
  formError: RepayConvertFormErrorType | undefined;
  validateRepayAmount: InputValidatorFn<string, RepayConvertFormErrorType>;
  /** Select */
  selectedRepayProduct: RepayConvertProductSelectValue | undefined;
  selectedSourceProduct: RepayConvertProductSelectValue | undefined;
  availableRepayProducts: RepayConvertProductSelectValue[];
  availableSourceProducts: RepayConvertProductSelectValue[];
  estimateStateTxs: SubaccountTx[];
  /** Source Product UI */
  sourceAmount: BigNumber | undefined;
  sourceAmountValueUsd: BigNumber | undefined;
  /** Repay Product UI */
  repayAmountValueUsd: BigNumber | undefined;
  disableMaxRepayButton: boolean;
  maxRepaySize: BigNumber | undefined;
  sizeIncrement: BigNumber | undefined;
  /** Misc UI */
  oracleConversionPrice: BigNumber | undefined;
  isMaxRepayDismissibleOpen: boolean | undefined;
  buttonState: BaseActionButtonState;
  /** Either repay or source, depending on whether we are selling / buying */
  market: AnnotatedSpotMarket | undefined;
  /** Handlers */
  onMaxRepayClicked: () => void;
  onAmountBorrowingClicked: () => void;
  onSubmit: () => void;
}
