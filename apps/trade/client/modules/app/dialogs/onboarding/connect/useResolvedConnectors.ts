import {
  getIsConnectorEnabledForChainEnv,
  isAppManagedWalletConnector,
  KNOWN_CONNECTOR_IDS,
  useEVMContext,
} from '@nadohq/react-client';
import { useIsDesktop } from '@nadohq/web-ui';
import {
  ConnectorMetadata,
  useCustomConnectorMetadataById,
} from 'client/modules/app/dialogs/onboarding/connect/useCustomConnectorMetadataById';
import { get, partition, remove } from 'lodash';
import { useMemo } from 'react';
import { Connector } from 'wagmi';

interface ConnectorWithMetadata {
  connector: Connector;
  metadata: ConnectorMetadata;
}

/**
 * A hook to reorder connectors that are given by wagmi, and overrides metadata for known connectors when needed
 */
export function useResolvedConnectors(connectors: readonly Connector[]) {
  const { primaryChainEnv } = useEVMContext();
  const isDesktop = useIsDesktop();
  const customConnectorMetadataById = useCustomConnectorMetadataById();

  return useMemo(() => {
    const filteredConnectors = connectors.filter((connector) => {
      const isEnabledForChainEnv = getIsConnectorEnabledForChainEnv(
        connector.id,
        primaryChainEnv,
      );
      // App managed connectors do not support direct connection
      const isAppManagedConnector = isAppManagedWalletConnector(connector);

      // Display Desktop Wallet Link exclusively on mobile and tablet.
      if (
        connector.id === KNOWN_CONNECTOR_IDS.desktopWalletLink &&
        !isDesktop
      ) {
        return true;
      }

      return isEnabledForChainEnv && !isAppManagedConnector;
    });

    const [injectedConnectors, otherConnectors] = partition(
      filteredConnectors,
      (connector) => {
        return connector.type === 'injected';
      },
    );

    // Extract the "generic" injected connector - we only show this if no other injected connector is present
    // We only expect 1 generic injected connector
    const genericInjectedConnectors = remove(
      injectedConnectors,
      (connector) => connector.id === 'injected',
    );

    if (injectedConnectors.length === 0) {
      injectedConnectors.push(...genericInjectedConnectors);
    }

    const connectorsWithMetadata = [
      ...injectedConnectors,
      ...otherConnectors,
    ].map((connector): ConnectorWithMetadata => {
      const metadata: ConnectorMetadata = get(
        customConnectorMetadataById,
        connector.id,
        {
          icon: connector.icon,
          name: connector.name,
        },
      );

      return {
        connector,
        metadata,
      };
    });

    return {
      connectorsWithMetadata,
    };
  }, [connectors, customConnectorMetadataById, isDesktop, primaryChainEnv]);
}
