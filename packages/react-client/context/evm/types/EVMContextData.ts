import { ChainEnv } from '@nadohq/client';
import { Chain } from 'viem';
import { Connector } from 'wagmi';
import { PrimaryChain } from '../../../types';
import { ChainStatus } from './ChainStatus';
import { ConnectionStatus } from './ConnectionStatus';

export interface EVMContextData {
  supportedChainEnvs: ChainEnv[];
  // Chains that are configured with wagmi
  supportedChains: readonly Chain[];
  primaryChainEnv: ChainEnv;
  setPrimaryChainEnv: (chainEnv: ChainEnv) => void;
  // Derived from primaryChainEnv
  primaryChain: PrimaryChain;
  chainStatus: ChainStatus;
  connectionStatus: ConnectionStatus;
  connectors: readonly Connector[];

  connect(connector: Connector): void;

  disconnect(): void;

  switchConnectedChain(chainId?: number): void; // Defaults chainID to the primary chain
}
