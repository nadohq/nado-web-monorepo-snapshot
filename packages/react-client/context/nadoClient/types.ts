import { ChainEnv, NadoClient } from '@nadohq/client';
import { Account } from 'viem';
import { PrimaryChain } from '../../types';

export interface NadoClientWithMetadata {
  primaryChain: PrimaryChain;
  chainEnv: ChainEnv;
  client: NadoClient;
}

export interface NadoClientSetLinkedSignerParams {
  signerAccount: Account | null;
  chainEnv: ChainEnv;
}
