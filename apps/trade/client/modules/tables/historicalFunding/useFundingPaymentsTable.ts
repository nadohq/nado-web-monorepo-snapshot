import {
  GetIndexerInterestFundingPaymentsResponse,
  IndexerProductPayment,
  removeDecimals,
} from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePaginatedSubaccountPaymentEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountPaymentEvents';
import { FundingPaymentsTableItem } from 'client/modules/tables/types/FundingPaymentsTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { createRowId } from 'client/utils/createRowId';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

interface Params {
  pageSize: number;
  productIds?: number[];
}

function extractItems(data: GetIndexerInterestFundingPaymentsResponse) {
  return data.fundingPayments;
}

export function useFundingPaymentsTable({ pageSize, productIds }: Params) {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const { currentPageData, isLoading, isFetchingCurrPage, pagination } =
    useDataTablePaginatedQuery({
      queryHook: usePaginatedSubaccountPaymentEvents,
      queryParams: {
        pageSize,
        productIds: productIds ?? allMarketsStaticData?.perpMarketsProductIds,
      },
      extractItems,
    });

  const mappedData: FundingPaymentsTableItem[] | undefined = useMemo(() => {
    if (!currentPageData || !allMarketsStaticData) {
      return;
    }

    const mappedData: FundingPaymentsTableItem[] = currentPageData
      .map(
        (item: IndexerProductPayment): FundingPaymentsTableItem | undefined => {
          const productTableItem = getProductTableItem({
            productId: item.productId,
            allMarketsStaticData,
          });

          const positionAmount = removeDecimals(item.balanceAmount);
          const positionSize = positionAmount.abs();

          // Hourly funding rate is the annualized rate divided by number of days in a year into number of hours in a day
          const hourlyFundingRateFrac = item.annualPaymentRate.div(365 * 24);

          const marginModeType = item.isolated ? 'isolated' : 'cross';

          return {
            ...productTableItem,
            submissionIndex: item.submissionIndex,
            timestampMillis: secondsToMilliseconds(item.timestamp.toNumber()),
            positionAmount,
            positionSize,
            notionalValueUsd: positionSize.times(item.oraclePrice),
            fundingRateFrac: hourlyFundingRateFrac,
            fundingPaymentQuote: removeDecimals(item.paymentAmount),
            marginModeType,
            rowId: createRowId(
              item.submissionIndex,
              item.productId,
              marginModeType,
            ),
          };
        },
      )
      .filter(nonNullFilter);

    return mappedData;
  }, [currentPageData, allMarketsStaticData]);

  return {
    mappedData,
    isLoading: isLoading || isFetchingCurrPage,
    pagination,
  };
}
