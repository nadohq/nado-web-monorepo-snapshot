import { removeDecimals } from '@nadohq/client';
import {
  AnnotatedSpotMarket,
  getHealthWeights,
  safeDiv,
} from '@nadohq/react-client';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { useMemo } from 'react';

interface Params {
  productId: number;
}

export function useSpotMarketDetailsDialog({ productId }: Params) {
  const { data: spotMarket } = useMarket<AnnotatedSpotMarket>({ productId });
  const { balances: spotBalances } = useSpotBalances();

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

    const totalSuppliedAmount = removeDecimals(
      spotMarket.product.totalDeposited,
    );
    const totalBorrowedAmount = removeDecimals(
      spotMarket.product.totalBorrowed,
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
  }, [spotMarket, spotBalances, productId]);
}
