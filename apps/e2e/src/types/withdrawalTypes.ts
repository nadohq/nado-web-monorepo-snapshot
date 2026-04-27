import { Expected } from 'src/types/commonTypes';

export interface WithdrawalHistoryItem {
  time: string;
  asset: string;
  amount: string;
  value: string;
  status: string | undefined;
}

export type ExpectedWithdrawalHistory = Expected<WithdrawalHistoryItem>;
