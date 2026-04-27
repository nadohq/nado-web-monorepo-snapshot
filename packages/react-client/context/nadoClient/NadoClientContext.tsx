import { ChainEnv } from '@nadohq/client';
import { createContext, ReactNode, useCallback, useMemo } from 'react';
import { useRequiredContext } from '../../hooks/useRequiredContext';
import { useEVMContext } from '../evm';
import { useNadoClientsQuery } from './hooks/useNadoClientsQuery';
import {
  NadoClientSetLinkedSignerParams,
  NadoClientWithMetadata,
} from './types';
import { getWalletClientForLinkedSignerAccount } from './utils';

interface Props {
  children: ReactNode;
}

interface NadoClientContextData {
  // Instance of NadoClient on the current primary chain
  primaryChainNadoClient: NadoClientWithMetadata | undefined;
  nadoClientsByChainEnv: Record<ChainEnv, NadoClientWithMetadata> | undefined;

  // Updates the 1CT signer on the relevant nado client
  setLinkedSigner(params: NadoClientSetLinkedSignerParams): void;
}

const NadoClientContext = createContext<NadoClientContextData | null>(null);

export const useNadoClientContext = () => useRequiredContext(NadoClientContext);

export function NadoClientContextProvider({ children }: Props) {
  const {
    primaryChainEnv,
    supportedChainEnvs,
    connectionStatus: { walletClient },
  } = useEVMContext();

  const { nadoClientsByChainEnv } = useNadoClientsQuery({
    walletClient,
    supportedChainEnvs,
  });

  const setLinkedSigner = useCallback(
    ({ signerAccount, chainEnv }: NadoClientSetLinkedSignerParams) => {
      const nadoClientWithMetadata = nadoClientsByChainEnv?.[chainEnv];
      if (!nadoClientWithMetadata) {
        console.warn(
          `[NadoClientContextProvider] Could not find Nado Client for ${chainEnv}. Skipping setting linked signer.`,
        );
        return;
      }
      nadoClientWithMetadata.client.setLinkedSigner(
        signerAccount
          ? getWalletClientForLinkedSignerAccount(
              signerAccount,
              nadoClientWithMetadata.primaryChain,
            )
          : null,
      );
    },
    [nadoClientsByChainEnv],
  );

  const data: NadoClientContextData = useMemo(() => {
    return {
      primaryChainNadoClient: nadoClientsByChainEnv?.[primaryChainEnv],
      nadoClientsByChainEnv,
      setLinkedSigner,
    };
  }, [primaryChainEnv, setLinkedSigner, nadoClientsByChainEnv]);

  return <NadoClientContext value={data}>{children}</NadoClientContext>;
}
