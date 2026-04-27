'use client';

import { PropsWithChildren } from 'react';
import { HIDDEN_PRODUCT_IDS_BY_CHAIN_ENV } from './consts/hiddenProductIdsByChainEnv';
import { NEW_PRODUCT_IDS_BY_CHAIN_ENV } from './consts/newProductIdsByChainEnv';
import { BaseNadoMetadataContextProvider } from './NadoMetadataContext';
import {
  PERP_METADATA_BY_CHAIN_ENV,
  SPOT_METADATA_BY_CHAIN_ENV,
} from './productMetadata/metadataByChainEnv';
import { PRIMARY_QUOTE_TOKEN_BY_CHAIN_ENV } from './productMetadata/primaryQuoteTokenByChainEnv';

export function WebNadoMetadataContextProvider({
  children,
}: PropsWithChildren) {
  return (
    <BaseNadoMetadataContextProvider
      spotMetadataByChainEnv={SPOT_METADATA_BY_CHAIN_ENV}
      perpMetadataByChainEnv={PERP_METADATA_BY_CHAIN_ENV}
      hiddenProductIdsByChainEnv={HIDDEN_PRODUCT_IDS_BY_CHAIN_ENV}
      newProductIdsByChainEnv={NEW_PRODUCT_IDS_BY_CHAIN_ENV}
      primaryQuoteTokenByChainEnv={PRIMARY_QUOTE_TOKEN_BY_CHAIN_ENV}
    >
      {children}
    </BaseNadoMetadataContextProvider>
  );
}
