import { DepositSourceChainConfig } from 'client/modules/collateral/deposit/DepositOptionsDialog/types';
import { clientEnv } from 'common/environment/clientEnv';
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  base,
  ink,
  inkSepolia,
  linea,
  mainnet,
  optimism,
  polygon,
  sei,
  sepolia,
  sonic,
} from 'viem/chains';

import arbIcon from 'client/modules/collateral/deposit/assets/chains/arb.svg';
import avaxIcon from 'client/modules/collateral/deposit/assets/chains/avax.svg';
import baseIcon from 'client/modules/collateral/deposit/assets/chains/base.svg';
import ethIcon from 'client/modules/collateral/deposit/assets/chains/eth.svg';
import inkIcon from 'client/modules/collateral/deposit/assets/chains/ink.svg';
import lineaIcon from 'client/modules/collateral/deposit/assets/chains/linea.svg';
import optimismIcon from 'client/modules/collateral/deposit/assets/chains/optimism.svg';
import polygonIcon from 'client/modules/collateral/deposit/assets/chains/polygon.svg';
import seiIcon from 'client/modules/collateral/deposit/assets/chains/sei.svg';
import sonicIcon from 'client/modules/collateral/deposit/assets/chains/sonic.svg';

const MAINNET_SOURCE_CHAINS: DepositSourceChainConfig[] = [
  { chain: ink, icon: inkIcon },
  { chain: mainnet, icon: ethIcon },
  { chain: arbitrum, icon: arbIcon },
  { chain: optimism, icon: optimismIcon },
  { chain: polygon, icon: polygonIcon },
  { chain: base, icon: baseIcon },
  { chain: avalanche, icon: avaxIcon },
  { chain: linea, icon: lineaIcon },
  { chain: sei, icon: seiIcon },
  { chain: sonic, icon: sonicIcon },
];

const TESTNET_SOURCE_CHAINS: DepositSourceChainConfig[] = [
  { chain: inkSepolia, icon: inkIcon },
  { chain: sepolia, icon: ethIcon },
  { chain: arbitrumSepolia, icon: arbIcon },
];

export const SOURCE_CHAINS = clientEnv.isTestnetDataEnv
  ? TESTNET_SOURCE_CHAINS
  : MAINNET_SOURCE_CHAINS;
