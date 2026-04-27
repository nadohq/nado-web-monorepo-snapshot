import {
  CHAIN_ENV_TO_CHAIN,
  ChainEnv,
  createNadoClient,
  WalletClientWithAccount,
} from '@nadohq/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useConfig } from 'wagmi';
import { getPublicClient } from 'wagmi/actions';
import { createQueryKey } from '../../../utils';
import { NadoClientWithMetadata } from '../types';

interface Params {
  walletClient: WalletClientWithAccount | undefined;
  supportedChainEnvs: ChainEnv[];
}

function nadoClientsQueryKey(supportedChainEnvs?: ChainEnv[]) {
  return createQueryKey('nadoClients', supportedChainEnvs);
}

export function useNadoClientsQuery({
  walletClient,
  supportedChainEnvs,
}: Params) {
  const wagmiConfig = useConfig();
  const walletClientChainId = walletClient?.chain?.id;

  const { data: nadoClientsByChainEnv, error } = useQuery({
    queryKey: nadoClientsQueryKey(supportedChainEnvs),
    queryFn: () => {
      return supportedChainEnvs.reduce(
        (prev, chainEnv) => {
          const primaryChain = CHAIN_ENV_TO_CHAIN[chainEnv];
          const publicClient = getPublicClient(wagmiConfig, {
            chainId: primaryChain.id,
          });

          if (!publicClient) {
            throw new Error(
              `[useNadoClientsQuery] No public client found for ${primaryChain.name}`,
            );
          }

          // Only set the wallet client for the chain that it's currently set to
          // Otherwise, we can be in weird states where EIP712 signatures / values are using the wrong chain ID
          const useWalletClient =
            walletClientChainId !== undefined &&
            walletClientChainId === primaryChain.id;
          const client = createNadoClient(chainEnv, {
            walletClient: useWalletClient ? walletClient : undefined,
            publicClient,
          });

          prev[chainEnv] = {
            chainEnv,
            primaryChain,
            client,
          };
          return prev;
        },
        {} as Record<ChainEnv, NadoClientWithMetadata>,
      );
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // Error and initialization logging
  useEffect(() => {
    if (error) {
      console.error('[useNadoClientsQuery] Error creating Nado clients', error);
    } else if (nadoClientsByChainEnv) {
      console.debug(
        '[useNadoClientsQuery] Nado clients initialized',
        Object.keys(nadoClientsByChainEnv),
      );
    }
  }, [error, nadoClientsByChainEnv]);

  // Update walletClient on the clients when it (or its chain ID) changes. We don't want to refetch the entire query
  // as that will reload dependencies such as the TV charts
  useEffect(() => {
    if (!nadoClientsByChainEnv) {
      return;
    }

    console.debug(
      '[useNadoClientsQuery] Updating WalletClient on Nado clients',
      walletClient,
      walletClientChainId,
    );

    Object.values(nadoClientsByChainEnv).forEach((clientWithMetadata) => {
      const useWalletClient =
        walletClientChainId !== undefined &&
        walletClientChainId === clientWithMetadata.primaryChain.id;

      clientWithMetadata.client.setWalletClient(
        useWalletClient ? walletClient : undefined,
      );
    });
  }, [walletClient, nadoClientsByChainEnv, walletClientChainId]);

  return {
    nadoClientsByChainEnv,
  };
}
