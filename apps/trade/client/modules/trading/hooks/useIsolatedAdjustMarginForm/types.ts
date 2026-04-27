import { LinkedAmountFractionSource } from 'client/types/linkedAmountFractionFormTypes';

export type IsolatedAdjustMarginFormErrorType =
  | 'invalid_input'
  | 'add_max_exceeded'
  | 'remove_max_exceeded'
  | 'below_min';

export type IsolatedAdjustMarginFormValues = {
  amount: string;
  amountFraction: number;
  adjustmentMode: IsolatedAdjustMarginMode;
  enableBorrows: boolean;
  amountSource: LinkedAmountFractionSource;
};

export type IsolatedAdjustMarginMode = 'add' | 'remove';
