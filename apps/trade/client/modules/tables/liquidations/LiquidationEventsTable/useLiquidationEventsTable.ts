import {
  GetIndexerSubaccountLiquidationEventsResponse,
  IndexerLiquidationEvent,
  QUOTE_PRODUCT_ID,
  removeDecimals,
} from '@nadohq/client';
import {
  CustomNumberFormatSpecifier,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { usePaginatedSubaccountLiquidationEvents } from 'client/hooks/query/subaccount/usePaginatedSubaccountLiquidationEvents';
import type {
  LiquidatedBalanceType,
  LiquidationEventsTableItem,
} from 'client/modules/tables/liquidations/types';
import { createRowId } from 'client/utils/createRowId';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

function extractItems(data: GetIndexerSubaccountLiquidationEventsResponse) {
  return data.events;
}

interface Params {
  pageSize: number;
  productIds?: number[];
}

export function useLiquidationEventsTable({ pageSize, productIds }: Params) {
  const { data: allMarketsStaticData, isLoading: marketsDataLoading } =
    useAllMarketsStaticData();

  const { isLoading, isFetchingCurrPage, currentPageData, pagination } =
    useDataTablePaginatedQuery({
      queryHook: usePaginatedSubaccountLiquidationEvents,
      queryParams: {
        pageSize,
        productIds: productIds
          ? Array.from(
              // Ensure quote product ID is included for quote balance delta calculations
              new Set([...productIds, QUOTE_PRODUCT_ID]),
            )
          : undefined,
      },
      extractItems,
    });

  const mappedData = useMemo((): LiquidationEventsTableItem[] | undefined => {
    if (!allMarketsStaticData) {
      return;
    }

    return currentPageData
      ?.map((event) => {
        return getHistoricalLiquidationsTableItem({
          event,
          allMarketsStaticData,
        });
      })
      .filter(nonNullFilter);
  }, [currentPageData, allMarketsStaticData]);

  return {
    isLoading: isLoading || marketsDataLoading || isFetchingCurrPage,
    mappedData,
    pagination,
  };
}

interface GetHistoricalLiquidationsTableItemParams {
  event: IndexerLiquidationEvent;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
}

/**
 * Converts an indexer liquidation event into a historical liquidations table item.
 * If we cannot resolve market data for a liquidated balance, null is returned instead of the item.
 *
 * @param event
 * @param allMarketsStaticData
 */
export function getHistoricalLiquidationsTableItem({
  event,
  allMarketsStaticData,
}: GetHistoricalLiquidationsTableItemParams): LiquidationEventsTableItem | null {
  const { spot, quote, perp, timestamp } = event;
  const liquidatedBalanceTypes: Set<LiquidatedBalanceType> = new Set();

  // Spot liquidation
  let spotLiquidation: LiquidationEventsTableItem['spot'];
  if (spot) {
    // Retrieve from spot products as NLP can also be liquidated
    const productMetadata =
      allMarketsStaticData.spotProducts[spot.indexerEvent.productId]?.metadata;

    if (!productMetadata) {
      console.warn(
        `[getHistoricalLiquidationsTableItem] Invalid liquidation event - spot product ${spot.indexerEvent.productId} not found.`,
      );
      return null;
    }

    const oraclePrice = spot.indexerEvent.state.market.product.oraclePrice;
    const amountLiquidated = removeDecimals(spot.amountLiquidated);

    const indexerEventMarket = spot.indexerEvent.state.market;

    spotLiquidation = {
      productId: indexerEventMarket.product.productId,
      productName: productMetadata.token.symbol,
      isIsolated: undefined,
      symbol: productMetadata.token.symbol,
      oraclePrice,
      priceFormatSpecifier: getMarketPriceFormatSpecifier(
        indexerEventMarket.priceIncrement,
      ),
      sizeFormatSpecifier: CustomNumberFormatSpecifier.NUMBER_AUTO,
      signedSizeFormatSpecifier: CustomNumberFormatSpecifier.SIGNED_NUMBER_AUTO,
      amountLiquidated,
      liquidatedValueUsd: amountLiquidated.multipliedBy(oraclePrice),
      liquidatedBalanceType: 'spot',
    };

    liquidatedBalanceTypes.add('spot');
  }

  // Perp liquidation
  let perpLiquidation: LiquidationEventsTableItem['perp'];
  if (perp) {
    const marketMetadata =
      allMarketsStaticData.perpMarkets[perp.indexerEvent.productId]?.metadata;

    if (!marketMetadata) {
      console.warn(
        `[getHistoricalLiquidationsTableItem] Invalid liquidation event - perp market ${perp.indexerEvent.productId} not found.`,
      );
      return null;
    }

    const indexerEventMarket = perp.indexerEvent.state.market;
    const oraclePrice = indexerEventMarket.product.oraclePrice;
    const amountLiquidated = removeDecimals(perp.amountLiquidated);

    const marketSizeFormatSpecifier = getMarketSizeFormatSpecifier({
      sizeIncrement: indexerEventMarket.sizeIncrement,
    });

    perpLiquidation = {
      productId: indexerEventMarket.product.productId,
      productName: marketMetadata.marketName,
      isIsolated: perp.indexerEvent.isolated,
      symbol: marketMetadata.symbol,
      oraclePrice,
      priceFormatSpecifier: getMarketPriceFormatSpecifier(
        indexerEventMarket.priceIncrement,
      ),
      sizeFormatSpecifier: marketSizeFormatSpecifier,
      signedSizeFormatSpecifier: `+${marketSizeFormatSpecifier}`,
      amountLiquidated,
      liquidatedValueUsd: amountLiquidated.multipliedBy(oraclePrice),
      liquidatedBalanceType: 'perp',
    };

    liquidatedBalanceTypes.add('perp');
  }

  // For quote payment, also bundle in vQuoteDelta changes as a result of perp liquidations
  let quoteBalanceDeltaWithDecimals = quote.balanceDelta;
  if (perp) {
    quoteBalanceDeltaWithDecimals = quoteBalanceDeltaWithDecimals.plus(
      perp.indexerEvent.state.postBalance.vQuoteBalance.minus(
        perp.indexerEvent.state.preBalance.vQuoteBalance,
      ),
    );
  }

  return {
    submissionIndex: event.submissionIndex,
    liquidatedBalanceTypes: Array.from(liquidatedBalanceTypes),
    spot: spotLiquidation,
    perp: perpLiquidation,
    quoteBalanceDelta: removeDecimals(quoteBalanceDeltaWithDecimals),
    timestampMillis: secondsToMilliseconds(timestamp.toNumber()),
    rowId: createRowId(
      event.submissionIndex,
      spotLiquidation?.productId ?? 'none',
      perpLiquidation?.productId ?? 'none',
    ),
  };
}
