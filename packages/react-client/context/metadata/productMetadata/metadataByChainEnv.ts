import { ChainEnv } from '@nadohq/client';
import {
  INK_SPOT_METADATA_BY_PRODUCT_ID,
  INK_TESTNET_SPOT_METADATA_BY_PRODUCT_ID,
} from './ink';
import { HARDHAT_SPOT_METADATA_BY_PRODUCT_ID } from './local';
import { PERP_METADATA_BY_PRODUCT_ID } from './perpMetadataByProductId';
import { PerpProductMetadata, SpotProductMetadata } from './types';

export const SPOT_METADATA_BY_CHAIN_ENV: Record<
  ChainEnv,
  Record<number, SpotProductMetadata>
> = {
  inkMainnet: INK_SPOT_METADATA_BY_PRODUCT_ID,
  inkTestnet: INK_TESTNET_SPOT_METADATA_BY_PRODUCT_ID,
  local: HARDHAT_SPOT_METADATA_BY_PRODUCT_ID,
};

export const PERP_METADATA_BY_CHAIN_ENV: Record<
  ChainEnv,
  Record<number, PerpProductMetadata>
> = {
  inkMainnet: PERP_METADATA_BY_PRODUCT_ID,
  inkTestnet: PERP_METADATA_BY_PRODUCT_ID,
  local: PERP_METADATA_BY_PRODUCT_ID,
};
