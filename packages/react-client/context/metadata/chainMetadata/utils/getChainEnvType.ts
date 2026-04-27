import { ChainEnv } from '@nadohq/client';

/**
 * The overarching "type" of the chain - regardless of whether it's testnet or mainnet
 * Ex. Ink Sepolia -> Chain env type of `ink``
 */
export type ChainEnvType = 'ink';

export function getChainEnvType(chainEnv: ChainEnv): ChainEnvType {
  switch (chainEnv) {
    case 'local':
      return 'ink';
    case 'inkMainnet':
    case 'inkTestnet':
      return 'ink';
  }
}
