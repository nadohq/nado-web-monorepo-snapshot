import { ChainEnv } from '@nadohq/client';

/**
 * Checks if a connector is enabled for a specific chain environment.
 * This function currently assumes that all connectors are enabled for all chain environments,
 * hence why arguments are not used and prefixed by _ due to linting rules.
 *
 * @param _connectorId The ID of the connector to check.
 * @param _chainEnv The chain environment to check against.
 * @returns True if the connector is enabled for the chain environment, false otherwise.
 */
export function getIsConnectorEnabledForChainEnv(
  _connectorId: string,
  _chainEnv: ChainEnv,
) {
  return true;
}
