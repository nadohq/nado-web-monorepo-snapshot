import { asyncResult } from '@nadohq/client';
import {
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQueryClient } from '@tanstack/react-query';
import {
  SubaccountOpenEngineOrders,
  subaccountOpenEngineOrdersQueryKey,
} from 'client/hooks/query/subaccount/useQuerySubaccountOpenEngineOrders';
import { useCallback } from 'react';

/**
 * Returns a function that updates the open engine orders for the current subaccount
 * The update fn takes a list of product IDs to update. This is more efficient than updating
 * all products at once.
 */
export function useUpdateOpenEngineOrdersQuery() {
  const nadoClient = usePrimaryChainNadoClient();
  const queryClient = useQueryClient();
  const {
    currentSubaccount: {
      name: subaccountName,
      address: subaccountOwner,
      chainEnv,
    },
  } = useSubaccountContext();

  return useCallback(
    async (productIds: number[]) => {
      if (!subaccountOwner || !nadoClient || !productIds.length) {
        return;
      }

      const refetchFn = async () => {
        const [newOrdersForProducts, error] = await asyncResult(
          nadoClient.market.getOpenSubaccountMultiProductOrders({
            productIds,
            subaccountName,
            subaccountOwner,
          }),
        );

        const queryKey = subaccountOpenEngineOrdersQueryKey(
          chainEnv,
          subaccountOwner,
          subaccountName,
        );

        if (!newOrdersForProducts || error) {
          // We couldn't load up-to-date data, so mark queries as stale (we don't want to refetch immediately as its unlikely
          // that a second query will succeed if the first fails
          queryClient.invalidateQueries({
            queryKey,
          });
          return;
        }

        queryClient.setQueriesData<SubaccountOpenEngineOrders>(
          {
            queryKey,
          },
          (prevData) => {
            const newData = {
              ...prevData,
            };

            newOrdersForProducts.productOrders.forEach((ordersForProduct) => {
              newData[ordersForProduct.productId] = ordersForProduct.orders;
            });

            return newData;
          },
        );
      };

      setTimeout(refetchFn, 50);
    },
    [chainEnv, queryClient, subaccountName, subaccountOwner, nadoClient],
  );
}
