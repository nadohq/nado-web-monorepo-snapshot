import { ChainEnv, EngineOrder } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { QueryState } from 'client/types/QueryState';

/**
 * Product ID -> EngineOrder[]
 */
export type SubaccountOpenEngineOrders = Record<number, EngineOrder[]>;

export function subaccountOpenEngineOrdersQueryKey(
  chainEnv?: ChainEnv,
  sender?: string,
  subaccountName?: string,
) {
  return createQueryKey(
    'subaccountOpenEngineOrders',
    chainEnv,
    sender,
    subaccountName,
  );
}

/**
 * All open engine orders for the current subaccount
 * @param params
 */
export function useQuerySubaccountOpenEngineOrders(): QueryState<SubaccountOpenEngineOrders> {
  const nadoClient = usePrimaryChainNadoClient();
  const { data: allMarketsData } = useAllMarkets();
  const {
    currentSubaccount: { name, address, chainEnv },
  } = useSubaccountContext();

  const allProductIds = allMarketsData?.allMarketsProductIds ?? [];

  const disabled = !nadoClient || !allProductIds?.length || !address;

  return useQuery({
    queryKey: subaccountOpenEngineOrdersQueryKey(chainEnv, address, name),
    queryFn: async (): Promise<SubaccountOpenEngineOrders> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const response =
        await nadoClient.market.getOpenSubaccountMultiProductOrders({
          subaccountOwner: address,
          subaccountName: name,
          productIds: allProductIds,
        });
      const multiProductOrders = response.productOrders;

      const productIdToOrders: SubaccountOpenEngineOrders = {};
      multiProductOrders.forEach((productOrders) => {
        productIdToOrders[productOrders.productId] = productOrders.orders;
      });

      return productIdToOrders;
    },
    enabled: !disabled,
    // This query is expensive, and our refetch-after-execute logic should take care of most data updates
    refetchInterval: 10000,
  });
}
