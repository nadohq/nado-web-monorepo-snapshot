import { ChainEnv } from '@nadohq/client';
import { clientEnv } from 'common/environment/clientEnv';

interface ChainEnvSwitcherOption {
  label: string;
  chainEnv: ChainEnv;
}

export const CHAIN_ENV_SWITCHER_OPTIONS = ((): ChainEnvSwitcherOption[] => {
  switch (clientEnv.base.dataEnv) {
    case 'nadoTestnet':
      return [
        {
          label: 'Ink',
          chainEnv: 'inkTestnet',
        },
      ];
    case 'nadoMainnet':
      return [
        {
          label: 'Ink',
          chainEnv: 'inkMainnet',
        },
      ];
    default:
      return [];
  }
})();
