import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';

export interface FundingPaymentsTableItem
  extends ProductTableItem, WithDataTableRowId {
  timestampMillis: number;
  positionAmount: BigNumber;
  positionSize: BigNumber;
  notionalValueUsd: BigNumber;
  fundingRateFrac: BigNumber;
  fundingPaymentQuote: BigNumber;
  marginModeType: MarginModeType;
  submissionIndex: string;
}
