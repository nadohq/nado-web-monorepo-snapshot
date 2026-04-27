import { addDecimals, toBigNumber, toIntegerString } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { usePlaceOrderMutationFn } from 'client/hooks/execute/placeOrder/usePlaceOrderMutationFn';
import { getMarketOrderExecutionPrice } from 'client/hooks/execute/util/getMarketOrderExecutionPrice';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateMaxSizeQueries } from 'client/hooks/execute/util/useUpdateMaxSizeQueries';
import { useUpdateOpenEngineOrdersQuery } from 'client/hooks/execute/util/useUpdateOpenEngineOrdersQuery';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import { useCallback } from 'react';

export interface ClosePositionParams {
  productId: number;
  isoSubaccountName: string | undefined;
  size: BigNumber;
  limitPrice?: BigNumber;
}

/**
 * Sends a market order to close the position for a product ID
 */
export function useExecuteClosePosition() {
  const placeOrderMutationFn = usePlaceOrderMutationFn();
  const {
    savedSettings: { market: marketSlippageFraction },
  } = useOrderSlippageSettings();
  const { data: perpPositions } = usePerpPositions();
  const { data: latestMarketPrices } = useQueryAllMarketsLatestPrices();

  const updateOpenEngineOrders = useUpdateOpenEngineOrdersQuery();
  const updateMaxSizes = useUpdateMaxSizeQueries();

  const closePositionMutationFn = useCallback(
    async (
      { productId, size, isoSubaccountName, limitPrice }: ClosePositionParams,
      context: ValidExecuteContext,
    ) => {
      const currentPosition = perpPositions?.find((pos) => {
        const matchesProductId = pos.productId === productId;
        const matchesMarginMode = pos.iso?.subaccountName === isoSubaccountName;

        return matchesMarginMode && matchesProductId;
      });

      if (
        !currentPosition?.amount ||
        currentPosition.amount.isZero() ||
        size.gt(currentPosition.amount.abs())
      ) {
        throw new Error(
          `[useExecuteClosePosition] Cannot close position: ${currentPosition?.amount.toString()} Amount requested: ${size.toString()}`,
        );
      }

      const marketOrderExecutionPrice = getMarketOrderExecutionPrice({
        // Closing a position will be opposite sign of existing position size
        isSell: currentPosition.amount.isPositive(),
        latestMarketPrices: latestMarketPrices?.[productId],
        marketSlippageFraction,
      });

      const price = limitPrice ?? marketOrderExecutionPrice;

      if (!price) {
        throw new Error(
          '[useExecuteClosePosition] Cannot close position, no price available',
        );
      }

      // Multiply the current position sign by the size and negate to close the position
      // If the position is positive, we want to close a positive amount
      // If the position is negative, we want to close a negative amount
      const amountToClose = toBigNumber(currentPosition.amount.s ?? 0)
        .multipliedBy(size)
        .negated();

      return placeOrderMutationFn(
        {
          price,
          amount: toIntegerString(addDecimals(amountToClose)),
          productId,
          orderType: limitPrice ? 'limit' : 'market',
          reduceOnly: true,
          iso: currentPosition.iso
            ? {
                borrowMargin: false,
                margin: 0,
              }
            : undefined,
        },
        context,
      );
    },
    [
      perpPositions,
      latestMarketPrices,
      marketSlippageFraction,
      placeOrderMutationFn,
    ],
  );

  const mutationFn = useExecuteInValidContext(closePositionMutationFn);

  return useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('[ClosePosition]', error, variables);
    },
    onSuccess(_, variables) {
      if (variables.limitPrice) {
        // Update limit orders
        updateOpenEngineOrders([variables.productId]);
        updateMaxSizes();
      }
    },
  });
}
