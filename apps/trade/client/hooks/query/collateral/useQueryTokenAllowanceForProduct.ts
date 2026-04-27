import {
  AnnotatedSpotMarket,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryTokenAllowance } from 'client/hooks/query/collateral/useQueryTokenAllowance';

interface Params {
  productId: number | undefined;
}

/**
 * Retrieves the token allowance for a Nado product
 *
 * @param productId
 */
export function useQueryTokenAllowanceForProduct({ productId }: Params) {
  const nadoClient = usePrimaryChainNadoClient();
  const { data: market } = useMarket<AnnotatedSpotMarket>({ productId });

  const spenderAddress = nadoClient?.context.contractAddresses.endpoint;

  return useQueryTokenAllowance({
    tokenAddress: market?.product.tokenAddr,
    spenderAddress,
  });
}
