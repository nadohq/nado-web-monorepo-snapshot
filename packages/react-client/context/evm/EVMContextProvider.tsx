import { ChainEnv } from '@nadohq/client';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { Chain } from 'viem';
import {
  Connector,
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';
import { getPrimaryChain } from '../../utils';
import { EVMContext } from './EVMContext';
import { useDidInitializeWalletConnection } from './hooks';
import { ChainStatus, ConnectionStatus, EVMContextData } from './types';
import { getIsConnectorEnabledForChainEnv } from './utils';

interface Props {
  children: ReactNode;
  primaryChainEnv: ChainEnv | undefined;
  supportedChainEnvs: ChainEnv[];
  supportedChains: readonly Chain[];
  setPrimaryChainEnv: (chainEnv: ChainEnv) => void;
}

/**
 * EVM context logic. Must also be wrapped by `WagmiProvider`.
 */
export function EVMContextProvider({
  primaryChainEnv: basePrimaryChainEnv,
  setPrimaryChainEnv: setBasePrimaryChainEnv,
  supportedChainEnvs,
  supportedChains,
  children,
}: Props) {
  const primaryChainEnv = useMemo((): ChainEnv => {
    // Failsafe check - if localstorage has an invalid value, just default to the first supported env
    if (
      basePrimaryChainEnv &&
      supportedChainEnvs.includes(basePrimaryChainEnv)
    ) {
      return basePrimaryChainEnv;
    }
    return supportedChainEnvs[0];
  }, [basePrimaryChainEnv, supportedChainEnvs]);

  const primaryChain = useMemo(() => {
    return getPrimaryChain(primaryChainEnv);
  }, [primaryChainEnv]);

  const didInitializeWalletConnection = useDidInitializeWalletConnection();
  // Wagmi does not give access to the active connector in the `connecting` state, so we store this state separately
  const [lastConnectRequestConnector, setLastConnectRequestConnector] =
    useState<Connector>();

  const primaryChainId = primaryChain.id;
  // We don't specify a `chainId` here because we want to use the active chain of the connected wallet
  // This is useful in bridging workflows where the user would be on a different chain than the primary chain
  const { data: walletClient } = useWalletClient();

  const {
    mutate: baseSwitchConnectedChain,
    error: switchConnectedChainError,
    isPending: isSwitchingConnectedChain,
  } = useSwitchChain();

  const {
    address: connectedAddress,
    status: connectedAccountStatus,
    connector: activeConnector,
    chain: connectedChain,
  } = useConnection();

  const { mutate: disconnect } = useDisconnect();
  const { mutate: baseConnect } = useConnect();
  const connectors = useConnectors();

  const connect = useCallback(
    (connector: Connector) => {
      setLastConnectRequestConnector(connector);
      baseConnect({
        // Specifying chain ID here is useful for WalletConnect, which can request connection for the specified chain
        // For some wallets, chain switching will be prompted automatically on connect
        chainId: primaryChainId,
        connector,
      });
    },
    [baseConnect, primaryChainId],
  );

  /**
   * Derives the current connection state
   */
  const connectionStatus = useMemo((): ConnectionStatus => {
    if (!didInitializeWalletConnection) {
      return {
        type: 'initializing',
        connector: activeConnector,
        address: undefined,
        walletClient: undefined,
      };
    }
    if (connectedAccountStatus === 'connected') {
      return {
        type: 'connected',
        connector: activeConnector,
        address: connectedAddress,
        walletClient,
      };
    }
    if (connectedAccountStatus === 'reconnecting') {
      return {
        type: 'reconnecting',
        connector: activeConnector,
        address: undefined,
        walletClient: undefined,
      };
    }
    if (connectedAccountStatus === 'connecting') {
      return {
        type: 'connecting',
        connector: lastConnectRequestConnector,
        address: undefined,
        walletClient: undefined,
      };
    }

    return {
      type: 'disconnected',
      connector: activeConnector,
      address: undefined,
      walletClient: undefined,
    };
  }, [
    connectedAddress,
    connectedAccountStatus,
    didInitializeWalletConnection,
    activeConnector,
    walletClient,
    lastConnectRequestConnector,
  ]);

  /**
   * Derive connected chain status
   */
  const chainStatus: ChainStatus = useMemo(() => {
    let statusType: ChainStatus['type'] = 'idle';
    if (isSwitchingConnectedChain) {
      statusType = 'switching';
    } else if (switchConnectedChainError) {
      statusType = 'switch_error';
    }

    return {
      type: statusType,
      isIncorrectChain:
        connectedAccountStatus === 'connected' &&
        connectedChain?.id !== primaryChainId,
      connectedChain,
    };
  }, [
    isSwitchingConnectedChain,
    switchConnectedChainError,
    connectedAccountStatus,
    connectedChain,
    primaryChainId,
  ]);

  const switchConnectedChain = useCallback(
    (chainId?: number) => {
      baseSwitchConnectedChain?.({
        chainId: chainId ?? primaryChainId,
      });
    },
    [baseSwitchConnectedChain, primaryChainId],
  );

  const setPrimaryChainEnv = useCallback(
    (chainEnv: ChainEnv) => {
      setBasePrimaryChainEnv(chainEnv);

      const chainId = getPrimaryChain(chainEnv).id;
      const currentConnectorId = connectionStatus.connector?.id;

      // If the current connector is not supported on the new chain, disconnect
      if (
        currentConnectorId &&
        !getIsConnectorEnabledForChainEnv(currentConnectorId, chainEnv)
      ) {
        disconnect();
      } else {
        // Otherwise, prompt the user to switch chains
        switchConnectedChain(chainId);
      }
    },
    [
      setBasePrimaryChainEnv,
      switchConnectedChain,
      disconnect,
      connectionStatus.connector?.id,
    ],
  );

  const evmContextData = useMemo((): EVMContextData => {
    return {
      primaryChainEnv,
      setPrimaryChainEnv,
      primaryChain,
      supportedChains,
      supportedChainEnvs,
      chainStatus,
      connectors,
      connectionStatus,
      connect,
      disconnect,
      switchConnectedChain,
    };
  }, [
    primaryChainEnv,
    setPrimaryChainEnv,
    primaryChain,
    supportedChains,
    supportedChainEnvs,
    chainStatus,
    connectors,
    connectionStatus,
    connect,
    disconnect,
    switchConnectedChain,
  ]);

  return <EVMContext value={evmContextData}>{children}</EVMContext>;
}
