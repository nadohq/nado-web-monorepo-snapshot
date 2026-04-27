import { ProductEngineType } from '@nadohq/client';
import {
  AnnotatedBalanceWithProduct,
  AnnotatedIsolatedPositionWithProduct,
} from '@nadohq/react-client';
import { MutationOptions, useMutation } from '@tanstack/react-query';

import {
  CancellableOrder,
  CancelOrdersResult,
} from 'client/hooks/execute/cancelOrder/types';
import { useExecuteCancelOrders } from 'client/hooks/execute/cancelOrder/useExecuteCancelOrders';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useQuerySubaccountIsolatedPositions } from 'client/hooks/query/subaccount/isolatedPositions/useQuerySubaccountIsolatedPositions';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import {
  SubaccountOpenTriggerOrdersData,
  useQuerySubaccountOpenTriggerOrders,
} from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';
import { getNadoClientHasLinkedSigner } from 'client/hooks/util/useNadoClientHasLinkedSigner';
import { getIsIsoTriggerOrder } from 'client/modules/trading/utils/isoOrderChecks';
import { getPriceTriggerCriteria } from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { useCallback } from 'react';
import { EmptyObject } from 'type-fest';

type CancelInvalidTpSlOrdersMutationOptions = Omit<
  MutationOptions<CancelOrdersResult, Error, EmptyObject>,
  'mutationFn'
>;

/**
 * Fetches positions and trigger orders, determines which orders should be cancelled,
 * and then sends the request to cancel them via  `useExecuteCancelOrders`.
 */
export function useExecuteCancelInvalidTpSlOrders(
  options: CancelInvalidTpSlOrdersMutationOptions = {},
) {
  const { mutateAsync: cancelOrdersAsync } = useExecuteCancelOrders();
  const { refetch: refetchOpenTriggerOrders } =
    useQuerySubaccountOpenTriggerOrders();
  const { refetch: refetchSubaccountSummary } = useQuerySubaccountSummary();
  const { refetch: refetchIsolatedPositions } =
    useQuerySubaccountIsolatedPositions();

  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        _: EmptyObject,
        context: ValidExecuteContext,
      ): Promise<CancelOrdersResult> => {
        if (!getNadoClientHasLinkedSigner(context.nadoClient)) {
          console.debug(
            '[useExecuteCancelInvalidTpSlOrders] No linked signer, skipping cancellations',
          );
          return {};
        }

        const openTriggerOrders = (
          await refetchOpenTriggerOrders({
            throwOnError: true,
          })
        ).data;
        const subaccountSummary = (
          await refetchSubaccountSummary({
            throwOnError: true,
          })
        ).data;
        const isolatedPositions = (
          await refetchIsolatedPositions({
            throwOnError: true,
          })
        ).data;

        if (!openTriggerOrders || !subaccountSummary || !isolatedPositions) {
          throw new Error(
            '[useExecuteCancelInvalidTpSlOrders] Failed to fetch data for cancelling invalid TP/SL orders',
          );
        }

        const ordersToCancel = getInvalidTpSlOrdersToCancel({
          balances: subaccountSummary.balances,
          isolatedPositions,
          openTriggerOrders,
        });

        if (!ordersToCancel.length) {
          return {};
        }

        console.debug(
          '[useExecuteCancelInvalidTpSlOrders] Cancelling invalid TP/SL orders',
          ordersToCancel,
        );

        return cancelOrdersAsync({ orders: ordersToCancel });
      },
      [
        refetchOpenTriggerOrders,
        refetchSubaccountSummary,
        refetchIsolatedPositions,
        cancelOrdersAsync,
      ],
    ),
  );

  const { onError, ...otherOptions } = options;

  return useMutation({
    mutationFn,
    onError(error, variables, onMutateResult, context) {
      logExecuteError('CancelInvalidTpSlOrders', error, variables);
      onError?.(error, variables, onMutateResult, context);
    },
    ...otherOptions,
  });
}

interface GetInvalidTpSlOrdersToCancelParams {
  balances: AnnotatedBalanceWithProduct[];
  isolatedPositions: AnnotatedIsolatedPositionWithProduct[];
  openTriggerOrders: SubaccountOpenTriggerOrdersData;
}

/**
 * Returns an array of invalid TP/SL orders that should be cancelled.
 * Invalid TP/SL orders can result when a user closes a position, the position
 * has been filled due to a TP/SL triggering, or its side has changed.
 */
export function getInvalidTpSlOrdersToCancel({
  balances,
  isolatedPositions,
  openTriggerOrders,
}: GetInvalidTpSlOrdersToCancelParams): CancellableOrder[] {
  const ordersToCancel: CancellableOrder[] = [];

  // Build lookup maps for efficient access
  const crossBalanceByProduct = new Map<number, AnnotatedBalanceWithProduct>();
  balances.forEach((balance) => {
    crossBalanceByProduct.set(balance.productId, balance);
  });

  const isolatedPositionByProduct = new Map<
    number,
    AnnotatedIsolatedPositionWithProduct
  >();
  isolatedPositions.forEach((position) => {
    isolatedPositionByProduct.set(position.baseBalance.productId, position);
  });

  // Iterate through ALL products that have trigger orders
  Object.entries(openTriggerOrders).forEach(([productIdStr, triggerOrders]) => {
    const productId = Number(productIdStr);

    // Get cross and isolated positions for this product
    const crossBalance = crossBalanceByProduct.get(productId);
    const isolatedPosition = isolatedPositionByProduct.get(productId);

    triggerOrders.forEach((triggerOrder) => {
      const orderDisplayType = getTriggerOrderDisplayType(triggerOrder);

      // Only handle perp products (TPSL only for perps currently) - cross balance should always be defined
      if (crossBalance?.type !== ProductEngineType.PERP) {
        return;
      }

      if (
        orderDisplayType !== 'stop_loss' &&
        orderDisplayType !== 'take_profit'
      ) {
        // Only handle TPSL orders
        return;
      }

      // If a TPSL has a dependent limit order, skip cancelling as the order may not have filled
      if (
        !!getPriceTriggerCriteria(triggerOrder.order.triggerCriteria)
          ?.dependency
      ) {
        return;
      }

      const isIsoTriggerOrder = getIsIsoTriggerOrder(triggerOrder);

      const positionAmount = isIsoTriggerOrder
        ? isolatedPosition?.baseBalance?.amount
        : crossBalance?.amount;

      // If the position amount is undefined, we assume the position is closed
      // We expect this to be the case for isolated positions
      const isPositionClosed = positionAmount?.isZero() ?? true;

      // The TP/SL amount should have the opposite sign of the position amount.
      // Having the same sign indicates the side has changed.
      const isInvalidOrderSide =
        positionAmount?.s === triggerOrder.order.amount.s;

      if (isInvalidOrderSide || isPositionClosed) {
        ordersToCancel.push({
          digest: triggerOrder.order.digest,
          isTrigger: true,
          productId,
        });
      }
    });
  });

  return ordersToCancel;
}
