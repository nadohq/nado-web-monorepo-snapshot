import {
  IndexerCollateralEvent,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import { getStaticMarketDataForProductId } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/getStaticMarketDataForProductId';
import {
  AllMarketsStaticDataForChainEnv,
  SpotStaticMarketData,
} from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { BaseCollateralEvent } from 'client/modules/events/collateral/types';
import { createRowId } from 'client/utils/createRowId';
import { secondsToMilliseconds } from 'date-fns';

export interface GetBaseCollateralEventParams {
  event: IndexerCollateralEvent;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
}

export function getBaseCollateralEvent({
  event,
  allMarketsStaticData,
}: GetBaseCollateralEventParams): BaseCollateralEvent {
  const productId = event.snapshot.market.productId;
  const staticSpotMarketData =
    getStaticMarketDataForProductId<SpotStaticMarketData>(
      productId,
      allMarketsStaticData,
    );
  if (!staticSpotMarketData) {
    throw new Error(`[getBaseCollateralEvent] Product ${productId} not found`);
  }

  const metadata = staticSpotMarketData.metadata.token;
  const amount = removeDecimals(toBigNumber(event.amount));
  const size = amount.abs();
  const oraclePrice = event.snapshot.market.product.oraclePrice;

  return {
    timestampMillis: secondsToMilliseconds(event.timestamp.toNumber()),
    submissionIndex: event.submissionIndex,
    productId,
    token: metadata,
    amount,
    size,
    valueUsd: size.times(oraclePrice),
    rowId: createRowId(event.submissionIndex, productId),
  };
}
