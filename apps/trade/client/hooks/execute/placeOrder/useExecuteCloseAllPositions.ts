import { addDecimals, BalanceSide } from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { useMutation } from '@tanstack/react-query';
import { usePlaceOrderMutationFn } from 'client/hooks/execute/placeOrder/usePlaceOrderMutationFn';
import { getMarketOrderExecutionPrice } from 'client/hooks/execute/util/getMarketOrderExecutionPrice';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useFilteredProductIds } from 'client/hooks/markets/useFilteredProductIds';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useCanUserExecute } from 'client/hooks/subaccount/useCanUserExecute';
import {
  PerpPositionItem,
  usePerpPositions,
} from 'client/hooks/subaccount/usePerpPositions';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import { roundToString } from 'client/utils/rounding';
import { useCallback, useMemo } from 'react';
import { EmptyObject } from 'type-fest';

export interface CloseAllPositionsFilter {
  /** Positions for these product IDs will be closed */
  productIds?: number[];
  /** If provided, only positions of this side will be closed */
  onlySide?: BalanceSide;
}

export function useExecuteCloseAllPositions({
  productIds,
  onlySide,
}: CloseAllPositionsFilter) {
  const { data: perpBalances } = usePerpPositions();
  const { filteredProductIds } = useFilteredProductIds({ productIds });
  const placeOrderMutationFn = usePlaceOrderMutationFn();
  const {
    savedSettings: { market: marketSlippageFraction },
  } = useOrderSlippageSettings();
  const { data: latestMarketPrices } = useQueryAllMarketsLatestPrices();
  const canUserExecute = useCanUserExecute();

  // Filter positions based on productIds filter
  const { positionsToClose, numLongPositions, numShortPositions } =
    useMemo(() => {
      const positionsToClose: PerpPositionItem[] = [];

      let numLongPositions = 0;
      let numShortPositions = 0;

      perpBalances?.forEach((balance) => {
        if (balance.amount.isZero()) {
          return;
        }
        if (!filteredProductIds.includes(balance.productId)) {
          return;
        }

        const isLong = balance.amount.isPositive();
        if (isLong) {
          numLongPositions++;
        } else {
          numShortPositions++;
        }

        if (onlySide === 'long' && !isLong) {
          return;
        }
        if (onlySide === 'short' && isLong) {
          return;
        }

        positionsToClose.push(balance);
      });

      return { positionsToClose, numLongPositions, numShortPositions };
    }, [perpBalances, filteredProductIds, onlySide]);

  const closeAllPositionsMutationFn = useCallback(
    async (_: EmptyObject, context: ValidExecuteContext) => {
      if (!positionsToClose?.length) {
        throw new Error('[useExecuteCloseAllPositions] No positions to close');
      }

      // Build orders for all positions
      const orders = positionsToClose
        .map((position) => {
          const price = getMarketOrderExecutionPrice({
            // Closing a position will be opposite sign of existing position size
            isSell: position.amount.isPositive(),
            latestMarketPrices: latestMarketPrices?.[position.productId],
            marketSlippageFraction,
          });

          if (!price) {
            console.error(
              `[useExecuteCloseAllPositions] Cannot close position for product ${position.productId}, no price available`,
            );
            return;
          }

          return {
            productId: position.productId,
            price,
            amount: roundToString(
              // Closing 100% of the position with close all positions feature
              addDecimals(position.amount).negated(),
              0,
            ),
            iso: position.iso
              ? {
                  borrowMargin: false,
                  margin: 0,
                }
              : undefined,
          };
        })
        .filter(nonNullFilter);

      return placeOrderMutationFn(
        {
          // productId/price/amount are overridden by the orders array
          productId: 0,
          price: 0,
          amount: 0,
          orderType: 'multi_limit',
          timeInForceType: MARKET_ORDER_EXECUTION_TYPE,
          reduceOnly: true,
          orders,
        },
        context,
      );
    },
    [
      positionsToClose,
      latestMarketPrices,
      marketSlippageFraction,
      placeOrderMutationFn,
    ],
  );

  const mutationFn = useExecuteInValidContext(closeAllPositionsMutationFn);

  const { mutateAsync, status } = useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('[useExecuteCloseAllPositions]', error, variables);
    },
    // No refetches needed as position updates will be received via websocket
  });

  return {
    closeAllPositions: mutateAsync,
    status,
    canClose: Boolean(
      positionsToClose?.length && status !== 'pending' && canUserExecute,
    ),
    positionsToClose,
    numLongPositions,
    numShortPositions,
    numPositions: numLongPositions + numShortPositions,
  };
}
