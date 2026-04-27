import { Address } from 'viem';

export interface DirectDepositReceiveDialogParams {
  directDepositAddress: Address;
  initialProductId?: number;
}
