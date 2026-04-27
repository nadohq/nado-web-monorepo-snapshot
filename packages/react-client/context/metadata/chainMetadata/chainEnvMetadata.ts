import { ChainEnv } from '@nadohq/client';
import type { ImageSrc } from '../../../types/ImageSrc';
import { getPrimaryChain } from '../../../utils/getPrimaryChain';
import { CHAIN_ICON_BY_CHAIN_ENV } from './chainIcons';
import { getChainEnvName, getChainName } from './utils/chainNameUtils';
import { ChainEnvType, getChainEnvType } from './utils/getChainEnvType';

export interface ChainEnvMetadata {
  chainEnvType: ChainEnvType;
  chainIcon: ImageSrc;
  chainEnvName: string;
  chainName: string;
}

export function getChainEnvMetadata(chainEnv: ChainEnv): ChainEnvMetadata {
  const chainEnvType = getChainEnvType(chainEnv);

  return {
    chainEnvType,
    chainIcon: CHAIN_ICON_BY_CHAIN_ENV[chainEnv],
    chainEnvName: getChainEnvName(chainEnv),
    chainName: getChainName(getPrimaryChain(chainEnv)),
  };
}
