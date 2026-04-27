import { NadoClient, WalletClientWithAccount } from '@nadohq/client';
import {
  AppSubaccount,
  usePrimaryChainNadoClient,
  usePrimaryChainPublicClient,
  usePrimaryChainWalletClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useCallback } from 'react';
import { PublicClient } from 'viem';

export interface ValidExecuteContext {
  /**
   * Nado client on the current chain
   */
  nadoClient: NadoClient;
  /**
   * Public client on the current chain
   */
  publicClient: PublicClient;
  /**
   * Wallet client on the current chain
   */
  walletClient: WalletClientWithAccount;
  subaccount: Required<AppSubaccount>;
}

/**
 * A simple higher order "hook" that takes in a function for executing an engine transaction,
 * but does pre-flight checks before sending it off
 */
export function useExecuteInValidContext<TParams = unknown, TData = unknown>(
  fn: (params: TParams, context: ValidExecuteContext) => Promise<TData>,
): (params: TParams) => Promise<TData> {
  const nadoClient = usePrimaryChainNadoClient();
  const publicClient = usePrimaryChainPublicClient();
  const walletClient = usePrimaryChainWalletClient();

  const { currentSubaccount } = useSubaccountContext();

  return useCallback(
    async (params: TParams) => {
      if (!nadoClient) {
        throw new Error(
          '[useExecuteInValidContext] Nado client not initialized',
        );
      }
      if (!publicClient) {
        throw new Error(
          '[useExecuteInValidContext] Public client not initialized',
        );
      }
      if (!walletClient) {
        throw new Error(
          '[useExecuteInValidContext] Wallet client not initialized',
        );
      }

      // Need to destructure here for typecheck statement on address to work
      const { address, chainEnv, chainId, name } = currentSubaccount;
      if (!address) {
        throw new Error(
          '[useExecuteInValidContext] No connected address found',
        );
      }

      const executeContext: ValidExecuteContext = {
        nadoClient,
        publicClient,
        walletClient,
        subaccount: {
          address,
          chainEnv,
          chainId,
          name,
        },
      };

      return fn(params, executeContext);
    },
    [currentSubaccount, fn, nadoClient, publicClient, walletClient],
  );
}
