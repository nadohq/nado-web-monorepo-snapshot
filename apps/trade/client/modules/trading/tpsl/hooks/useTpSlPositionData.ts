import { BigNumber } from 'bignumber.js';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { useMemo } from 'react';

export interface TpSlPositionData {
  amount: BigNumber;
  netEntryCost: BigNumber | undefined;
  averageEntryPrice: BigNumber | undefined;
  isoNetMarginTransferred: BigNumber | undefined;
  isoLeverage: number | undefined;
  estimatedLiquidationPrice: BigNumber | null;
}

export function useTpSlPositionData({
  productId,
  isIso,
}: {
  productId: number;
  isIso: boolean;
}): TpSlPositionData | undefined {
  const { data: positionsData } = usePerpPositions();

  return useMemo(() => {
    const perpPositionItem = positionsData?.find((position) => {
      const matchesProductId = position.productId === productId;
      const matchesMarginMode = !!position.iso === isIso;

      return matchesProductId && matchesMarginMode;
    });

    if (!perpPositionItem) {
      return;
    }

    // Compute the net entry cost instead of finding the entry directly through indexer snapshots, this is slightly easier
    const netEntryCost = perpPositionItem.price.averageEntryPrice?.times(
      perpPositionItem.amount,
    );

    return {
      amount: perpPositionItem.amount,
      averageEntryPrice: perpPositionItem.price.averageEntryPrice,
      netEntryCost,
      isoNetMarginTransferred: perpPositionItem.iso?.netMarginTransferred,
      isoLeverage: perpPositionItem.iso?.leverage,
      estimatedLiquidationPrice: perpPositionItem.estimatedLiquidationPrice,
    };
  }, [isIso, positionsData, productId]);
}
