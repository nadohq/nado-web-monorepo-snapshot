import { ChainEnv } from '@nadohq/client';

interface GetPrimaryChainEnvOrDefaultParams {
  primaryChainEnv: ChainEnv | undefined;
  supportedChainEnvs: ChainEnv[];
}

/**
 * Returns the primary chain env if it's valid, otherwise returns the first supported chain env as a default.
 */
export function getPrimaryChainEnvOrDefault({
  primaryChainEnv: basePrimaryChainEnv,
  supportedChainEnvs,
}: GetPrimaryChainEnvOrDefaultParams): ChainEnv {
  if (basePrimaryChainEnv && supportedChainEnvs.includes(basePrimaryChainEnv)) {
    return basePrimaryChainEnv;
  }
  return supportedChainEnvs[0];
}
