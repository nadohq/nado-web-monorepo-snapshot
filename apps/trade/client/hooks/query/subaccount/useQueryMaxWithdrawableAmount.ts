import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';

export function maxWithdrawableQueryKey(
  chainEnv?: ChainEnv,
  sender?: string,
  subaccountName?: string,
  productId?: number,
  spotLeverage?: boolean,
) {
  return createQueryKey(
    'maxWithdrawable',
    chainEnv,
    sender,
    subaccountName,
    productId,
    spotLeverage,
  );
}

interface Params {
  productId?: number;
  /** Whether to use spot leverage */
  spotLeverage?: boolean;
  /** The subaccount name to query for */
  subaccountName?: string;
  /** Whether the query is disabled */
  disabled?: boolean;
}

/**
 * Max withdrawable amount. Always non-negative, includes any current positive balances
 * @param params Configuration parameters for the query
 * @returns Query result with max withdrawable amount
 */
export function useQueryMaxWithdrawableAmount(params: Params) {
  const { currentSubaccount } = useSubaccountContext();
  const nadoClient = usePrimaryChainNadoClient();

  const subaccountName = params.subaccountName ?? currentSubaccount.name;

  const productId = params.productId ?? 0;
  const spotLeverage = params.spotLeverage ?? false;

  const disabled = !currentSubaccount.address || !nadoClient || params.disabled;

  return useQuery({
    queryKey: maxWithdrawableQueryKey(
      currentSubaccount.chainEnv,
      currentSubaccount.address,
      subaccountName,
      productId,
      spotLeverage,
    ),
    queryFn: async (): Promise<BigNumber> => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.spot.getMaxWithdrawable({
        subaccountOwner: currentSubaccount.address ?? '',
        subaccountName,
        productId,
        spotLeverage,
      });
    },
    enabled: !disabled,
    // Refetches are handled by WS event listeners
  });
}
