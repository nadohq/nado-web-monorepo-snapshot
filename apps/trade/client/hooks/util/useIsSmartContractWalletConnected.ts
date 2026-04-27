import { getValidatedAddress } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainPublicClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

const KNOWN_SC_WALLET_IDS: string[] = [];

/**
 * Returns whether the current wallet is a smart contract wallet. This is not a perfect check, so it is possible for this to return false negatives.
 */
export function useIsSmartContractWalletConnected() {
  const publicClient = usePrimaryChainPublicClient();
  const {
    connectionStatus: { connector, address },
  } = useEVMContext();

  const isKnownSmartContractWallet = KNOWN_SC_WALLET_IDS.includes(
    connector?.id ?? '',
  );

  const disableQuery = !address || !publicClient || isKnownSmartContractWallet;
  const { data: isSmartContract } = useQuery({
    queryKey: createQueryKey('isSmartContractWalletCodeCheck', address),
    queryFn: async () => {
      if (disableQuery) {
        throw new QueryDisabledError();
      }
      const code = await publicClient.getCode({
        address: getValidatedAddress(address),
      });

      return !!code && code !== '0x';
    },
    enabled: !disableQuery,
  });

  return isKnownSmartContractWallet || isSmartContract;
}
