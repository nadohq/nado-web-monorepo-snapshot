import {
  BalanceSide,
  ChainEnv,
  GetEngineMaxOrderSizeParams,
  toBigNumber,
} from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useMemo } from 'react';

export type UseQueryMaxOrderSizeParams = Omit<
  GetEngineMaxOrderSizeParams,
  'subaccountOwner' | 'subaccountName' | 'price'
> & {
  price: BigNumber | number;
};

export function maxOrderSizeQueryKey(
  chainEnv?: ChainEnv,
  sender?: string,
  subaccountName?: string,
  productId?: number,
  side?: BalanceSide,
  price?: BigNumber,
  reduceOnly?: boolean,
  spotLeverage?: boolean,
  isoBorrowMargin?: boolean,
) {
  return createQueryKey(
    'maxOrderSize',
    chainEnv,
    sender,
    subaccountName,
    productId,
    side,
    price?.toString(),
    reduceOnly ?? null,
    spotLeverage ?? null,
    isoBorrowMargin ?? null,
  );
}

export function useQueryMaxOrderSize(params?: UseQueryMaxOrderSizeParams) {
  const { currentSubaccount } = useSubaccountContext();
  const nadoClient = usePrimaryChainNadoClient();

  const queryParams = useMemo((): GetEngineMaxOrderSizeParams | undefined => {
    if (!currentSubaccount.address || !params) {
      return undefined;
    }

    return {
      ...params,
      price: toBigNumber(params.price),
      subaccountOwner: currentSubaccount.address,
      subaccountName: currentSubaccount.name,
    };
  }, [currentSubaccount.address, currentSubaccount.name, params]);

  const disabled = !nadoClient || !queryParams;

  return useQuery({
    queryKey: maxOrderSizeQueryKey(
      currentSubaccount.chainEnv,
      queryParams?.subaccountOwner,
      queryParams?.subaccountName,
      queryParams?.productId,
      queryParams?.side,
      queryParams?.price,
      queryParams?.reduceOnly,
      queryParams?.spotLeverage,
      queryParams?.isoBorrowMargin,
    ),
    queryFn: async (): Promise<BigNumber> => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.market.getMaxOrderSize(queryParams);
    },
    enabled: !disabled,
    // Refetches are handled by WS event listeners
  });
}
