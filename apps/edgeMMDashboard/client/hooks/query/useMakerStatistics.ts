import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

function makerStatisticsQueryKey(
  chainEnv?: ChainEnv,
  productId?: number,
  epoch?: number,
  interval?: number,
) {
  return createQueryKey(
    'makerStatistics',
    chainEnv,
    productId,
    epoch,
    interval,
  );
}

interface Params {
  productId: number | undefined;
  epoch: number | undefined;
  interval: number;
}

export function useMakerStatistics({ productId, epoch, interval }: Params) {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const disabled = !nadoClient || productId == null || !epoch;

  return useQuery({
    queryKey: makerStatisticsQueryKey(
      primaryChainEnv,
      productId,
      epoch,
      interval,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      return nadoClient.context.indexerClient.getMakerStatistics({
        productId,
        epoch,
        interval,
      });
    },
    enabled: !disabled,
  });
}
