import { useQuerySymbols } from '@nadohq/react-client';
import { useMemo } from 'react';

export interface MarketPointsBoost {
  /**
   * If zero, there's no boost. Nothing should be shown in UI
   */
  takerBoost: number;
  /**
   * If zero, there's no boost. Nothing should be shown in UI
   */
  makerBoost: number;
  boostType: 'low' | 'medium' | 'high';
}

export function useAllMarketsPointsBoosts() {
  const { data: symbolsData, ...rest } = useQuerySymbols();

  const mappedData = useMemo(() => {
    if (!symbolsData) return;
    const boostsByProductId: Record<number, MarketPointsBoost> = {};

    Object.values(symbolsData).forEach(
      ({ takerMultiplier, makerMultiplier, boostType, productId }) => {
        const mappedBoostType = (() => {
          // Backend returns numerical int types.
          switch (boostType) {
            case 1:
              return 'medium';
            case 2:
              return 'low';
            case 3:
              return 'high';
            default:
              return;
          }
        })();

        if (
          !mappedBoostType ||
          takerMultiplier == null ||
          makerMultiplier == null
        )
          return;

        boostsByProductId[productId] = {
          takerBoost: takerMultiplier,
          makerBoost: makerMultiplier,
          boostType: mappedBoostType,
        };
      },
    );

    return boostsByProductId;
  }, [symbolsData]);

  return {
    data: mappedData,
    ...rest,
  };
}
