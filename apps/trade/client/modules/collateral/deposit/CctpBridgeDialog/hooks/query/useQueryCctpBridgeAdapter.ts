import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { EIP1193Provider } from 'viem';

/** Viem adapter type for Circle Bridge Kit. */
export type CctpBridgeAdapter = Awaited<
  ReturnType<typeof createViemAdapterFromProvider>
>;

function cctpBridgeAdapterQueryKey(connectorUid?: string) {
  return createQueryKey('cctpBridgeAdapter', connectorUid);
}

/**
 * Hook that creates a Circle Bridge adapter from the current wallet connector.
 *
 * The adapter wraps the wallet's EIP-1193 provider, which is chain-agnostic.
 * Chain switches do NOT require a new adapter — the SDK resolves the correct
 * chain from the `chain` parameter passed in BridgeParams.
 *
 * @returns The adapter query result (data is `undefined` while loading or when
 *   no wallet is connected).
 */
export function useQueryCctpBridgeAdapter(): {
  data: CctpBridgeAdapter | undefined;
} {
  const { connectionStatus } = useEVMContext();
  const connector = connectionStatus.connector;
  const disabled = !connector;

  return useQuery({
    queryKey: cctpBridgeAdapterQueryKey(connector?.uid),
    queryFn: async (): Promise<CctpBridgeAdapter> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      // The provider must come from the wallet connector (not chain config)
      // because the Bridge SDK needs a signing-capable provider to submit
      // transactions on behalf of the user.
      const provider = (await connector.getProvider()) as EIP1193Provider;

      if (!provider) {
        throw new Error('No provider available from wallet connector.');
      }

      return createViemAdapterFromProvider({ provider });
    },
    enabled: !disabled,
    // The adapter is chain-agnostic (EIP-1193 provider handles chain switching
    // internally), so it does not need to be refetched when the source chain changes.
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
