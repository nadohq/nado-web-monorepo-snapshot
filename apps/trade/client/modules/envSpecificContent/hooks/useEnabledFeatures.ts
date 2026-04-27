import { INK_CHAIN_ENVS } from '@nadohq/react-client';
import { NO_SPOT_CHAIN_ENVS } from 'client/modules/envSpecificContent/consts/noSpotChainEnvs';
import { useIsEnabledForChainEnvs } from 'client/modules/envSpecificContent/hooks/useIsEnabledForChainEnvs';

interface UseEnabledFeatures {
  isSpotTradingEnabled: boolean;
  isFuulVolumeTrackingEnabled: boolean;
  isNotifiEnabled: boolean;
}

export function useEnabledFeatures(): UseEnabledFeatures {
  const isSpotTradingEnabled = !useIsEnabledForChainEnvs(NO_SPOT_CHAIN_ENVS);

  const isFuulVolumeTrackingEnabled = useIsEnabledForChainEnvs([
    ...INK_CHAIN_ENVS,
  ]);

  const isNotifiEnabled = useIsEnabledForChainEnvs([...INK_CHAIN_ENVS]);

  return {
    isSpotTradingEnabled,
    isFuulVolumeTrackingEnabled,
    isNotifiEnabled,
  };
}
