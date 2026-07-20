import { removeDecimals } from '@nadohq/client';
import {
  AnnotatedSpotMarket,
  getHealthWeights,
  safeDiv,
  toXStocksDisplayAmount,
} from '@nadohq/react-client';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { useMemo } from 'react';

interface Params {
  productId: number;
}

export function useSpotMarketDetailsDialog({ productId }: Params) {
  const { data: spotMarket } = useMarket<AnnotatedSpotMarket>({ productId });
  const { balances: spotBalances } = useSpotBalances();
  const { getExchangeRate } = useGetXStocksExchangeRate();

  return useMemo(() => {
    const spotBalance = spotBalances?.find(
      (balance) => balance.productId === productId,
    );

    if (!spotBalance || !spotMarket) {
      return {};
    }

    const healthWeights = getHealthWeights(
      spotBalance.amount,
      spotMarket.product,
    );

    const exchangeRate = getExchangeRate(productId);
    const totalSuppliedAmount = toXStocksDisplayAmount(
      removeDecimals(spotMarket.product.totalDeposited),
      exchangeRate,
    );
    const totalBorrowedAmount = toXStocksDisplayAmount(
      removeDecimals(spotMarket.product.totalBorrowed),
      exchangeRate,
    );

    return {
      tokenSymbol: spotMarket.metadata.token.symbol,
      initialMarginUsd: spotBalance.healthMetrics.initial,
      initialWeight: healthWeights?.initial,
      maintenanceMarginUsd: spotBalance.healthMetrics.maintenance,
      maintenanceWeight: healthWeights?.maintenance,
      totalSuppliedAmount,
      totalBorrowedAmount,
      utilizationFrac: safeDiv(totalBorrowedAmount, totalSuppliedAmount),
      availableLiquidityAmount: totalSuppliedAmount.minus(totalBorrowedAmount),
    };
  }, [spotMarket, spotBalances, productId, getExchangeRate]);
}
