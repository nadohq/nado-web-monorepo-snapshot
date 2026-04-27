import { LinkedAmountFractionFormValues } from 'client/types/linkedAmountFractionFormTypes';

export type SubaccountQuoteTransferErrorType =
  | 'invalid_input'
  | 'below_min'
  | 'max_exceeded';

export interface SubaccountQuoteTransferFormValues extends LinkedAmountFractionFormValues {
  senderSubaccountName: string;
  recipientSubaccountName: string;
  enableBorrows: boolean;
}
