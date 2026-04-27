import { useNadoMetadataContext } from '../context';

export function useIsChainEnvType() {
  const {
    primaryChainEnvMetadata: { chainEnvType },
  } = useNadoMetadataContext();

  const isInk = chainEnvType === 'ink';

  return {
    isInk,
  };
}
