import {
  GetIndexerInterestFundingPaymentsResponse,
  IndexerProductPayment,
  QUOTE_PRODUCT_ID,
  removeDecimals,
} from '@nadohq/client';
import { SpotProductMetadata } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { getStaticMarketDataForProductId } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/getStaticMarketDataForProductId';
import { SpotStaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { usePaginatedSubaccountPaymentEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountPaymentEvents';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { createRowId } from 'client/utils/createRowId';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

export interface InterestPaymentsTableItem extends WithDataTableRowId {
  productId: number;
  timestampMillis: number;
  metadata: SpotProductMetadata;
  balanceAmount: BigNumber;
  interestRateFrac: BigNumber;
  interestPaidAmount: BigNumber;
  valueUsd: BigNumber;
  marginModeType: MarginModeType;
  submissionIndex: string;
}

interface Params {
  pageSize: number;
}

function extractItems(data: GetIndexerInterestFundingPaymentsResponse) {
  return data.interestPayments;
}

export function useInterestPaymentsTable({ pageSize }: Params) {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const productIds = allMarketsStaticData
    ? [QUOTE_PRODUCT_ID, ...allMarketsStaticData.spotMarketsProductIds]
    : undefined;

  const { currentPageData, isLoading, isFetchingCurrPage, pagination } =
    useDataTablePaginatedQuery({
      queryHook: usePaginatedSubaccountPaymentEvents,
      queryParams: {
        pageSize,
        productIds,
      },
      extractItems,
    });

  const mappedData: InterestPaymentsTableItem[] | undefined = useMemo(() => {
    if (!currentPageData || !allMarketsStaticData) {
      return;
    }

    return currentPageData
      .map((item: IndexerProductPayment) => {
        const spotProduct =
          getStaticMarketDataForProductId<SpotStaticMarketData>(
            item.productId,
            allMarketsStaticData,
          );

        if (!spotProduct) {
          return;
        }

        const { metadata } = spotProduct;
        const interestPaidAmount = removeDecimals(item.paymentAmount);

        const marginModeType: MarginModeType = item.isolated
          ? 'isolated'
          : 'cross';

        return {
          productId: item.productId,
          timestampMillis: secondsToMilliseconds(item.timestamp.toNumber()),
          submissionIndex: item.submissionIndex,
          metadata,
          balanceAmount: removeDecimals(item.balanceAmount),
          interestRateFrac: item.annualPaymentRate,
          interestPaidAmount,
          valueUsd: interestPaidAmount.multipliedBy(item.oraclePrice),
          marginModeType,
          rowId: createRowId(
            item.submissionIndex,
            item.productId,
            marginModeType,
          ),
        };
      })
      .filter(nonNullFilter);
  }, [allMarketsStaticData, currentPageData]);

  return {
    mappedData,
    isLoading: isLoading || isFetchingCurrPage,
    pagination,
  };
}
