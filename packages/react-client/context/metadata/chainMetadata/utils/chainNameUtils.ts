import { ChainEnv } from '@nadohq/client';
import { startCase } from 'lodash';
import { Chain } from 'viem';

export function getChainEnvName(chainEnv: ChainEnv) {
  return startCase(chainEnv);
}

export function getChainName(chain: Chain) {
  return startCase(chain.name);
}
