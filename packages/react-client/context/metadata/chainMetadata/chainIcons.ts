import { ChainEnv } from '@nadohq/client';
import type { ImageSrc } from '../../../types/ImageSrc';
import inkLogo from './chains/ink.svg';

export const CHAIN_ICON_BY_CHAIN_ENV: Record<ChainEnv, ImageSrc> = {
  inkMainnet: inkLogo,
  inkTestnet: inkLogo,
  local: inkLogo,
};
