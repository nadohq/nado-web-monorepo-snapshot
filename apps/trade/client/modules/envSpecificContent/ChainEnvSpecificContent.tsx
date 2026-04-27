import { ChainEnv } from '@nadohq/client';
import { WithChildren } from '@nadohq/web-common';
import { useIsEnabledForChainEnvs } from 'client/modules/envSpecificContent/hooks/useIsEnabledForChainEnvs';

interface Props extends WithChildren {
  enabledChainEnvs: ChainEnv[];
}

export function ChainEnvSpecificContent({ children, enabledChainEnvs }: Props) {
  const isContentVisible = useIsEnabledForChainEnvs(enabledChainEnvs);

  if (!isContentVisible) {
    return null;
  }

  return <>{children}</>;
}
