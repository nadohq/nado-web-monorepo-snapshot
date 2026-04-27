'use client';

import { ChainEnv } from '@nadohq/client';
import { createContext, PropsWithChildren, useCallback, useMemo } from 'react';
import { useEVMContext } from '../../context/evm';
import { useRequiredContext } from '../../hooks/useRequiredContext';
import { ImageSrc, MetadataContextImageSrc } from '../../types/ImageSrc';
import { ChainEnvMetadata, getChainEnvMetadata } from './chainMetadata';
import {
  PerpProductMetadata,
  SpotProductMetadata,
  Token,
} from './productMetadata/types';

export interface NadoMetadataContextData {
  /**
   * The token used as the primary quote product (product ID of 0)
   */
  primaryQuoteToken: Token<MetadataContextImageSrc>;
  /**
   * Primary chain metadata.
   */
  primaryChainEnvMetadata: ChainEnvMetadata;
  getChainEnvMetadata: (chainEnv: ChainEnv) => ChainEnvMetadata;

  /**
   * We often want to hide certain markets for trading. Positions will still be shown but the market won't
   * show up in the markets dropdown
   */
  getIsHiddenMarket(productId: number): boolean;

  /**
   * We want to feature new markets on the UI, this centralizes the logic for determining whether a market is new
   */
  getIsNewMarket(productId: number): boolean;

  getSpotMetadata(
    productId: number,
  ): SpotProductMetadata<MetadataContextImageSrc> | undefined;

  getPerpMetadata(
    productId: number,
  ): PerpProductMetadata<MetadataContextImageSrc> | undefined;

  getSpotMetadataByChainEnv(
    chainEnv: ChainEnv,
    productId: number,
  ): SpotProductMetadata<MetadataContextImageSrc> | undefined;
}

const NadoMetadataContext = createContext<NadoMetadataContextData | null>(null);

export const useNadoMetadataContext = () =>
  useRequiredContext(NadoMetadataContext);

interface Props<TAsset = ImageSrc> extends PropsWithChildren {
  spotMetadataByChainEnv: Record<
    ChainEnv,
    Record<number, SpotProductMetadata<TAsset>>
  >;
  perpMetadataByChainEnv: Record<
    ChainEnv,
    Record<number, PerpProductMetadata<TAsset>>
  >;
  hiddenProductIdsByChainEnv: Record<ChainEnv, Set<number>>;
  newProductIdsByChainEnv: Record<ChainEnv, Set<number>>;
  primaryQuoteTokenByChainEnv: Record<ChainEnv, Token<TAsset>>;
}

export function BaseNadoMetadataContextProvider<TAsset = ImageSrc>({
  children,
  spotMetadataByChainEnv,
  perpMetadataByChainEnv,
  hiddenProductIdsByChainEnv,
  newProductIdsByChainEnv,
  primaryQuoteTokenByChainEnv,
}: Props<TAsset>) {
  const { primaryChainEnv } = useEVMContext();

  /**
   * Why the casting is necessary:
   * `NadoMetadataContextData` is not generic — its methods return `SpotProductMetadata<MetadataContextImageSrc>` etc.
   * But the value in the closure is `SpotProductMetadata<TAsset>`, and TypeScript can't prove those are the
   * same type because `TAsset` is a free type variable.
   *
   * The cast is safe in both real cases:
   * - **Mobile**: `TAsset` = `ImageSrc` = `FC<SvgProps>` for static data (passed in via props), but the context
   *   output is `MetadataContextImageSrc` = `string` — both refer to what consumers will actually receive at runtime
   * - **Web**: `TAsset` = `ImageSrc` = `WebImageSrc` = `MetadataContextImageSrc` → cast is a no-op
   *
   * If we wanted to avoid the cast entirely, we'd have to make `NadoMetadataContextData` generic too, which
   * would cascade into the React context itself and React contexts can't be typed generically per-platform.
   * The cast is the right isolation point: everything above it (props, static data) is accurately generic,
   * everything below it (context consumers) gets the correct platform-resolved `MetadataContextImageSrc`.
   */
  const getSpotMetadata = useCallback(
    (
      productId: number,
    ): SpotProductMetadata<MetadataContextImageSrc> | undefined => {
      return spotMetadataByChainEnv[primaryChainEnv][
        productId
      ] as SpotProductMetadata<MetadataContextImageSrc>;
    },
    [primaryChainEnv, spotMetadataByChainEnv],
  );

  const getSpotMetadataByChainEnv = useCallback(
    (
      chainEnv: ChainEnv,
      productId: number,
    ): SpotProductMetadata<MetadataContextImageSrc> | undefined => {
      return spotMetadataByChainEnv[chainEnv][
        productId
      ] as SpotProductMetadata<MetadataContextImageSrc>;
    },
    [spotMetadataByChainEnv],
  );

  const getPerpMetadata = useCallback(
    (
      productId: number,
    ): PerpProductMetadata<MetadataContextImageSrc> | undefined => {
      return perpMetadataByChainEnv[primaryChainEnv][
        productId
      ] as PerpProductMetadata<MetadataContextImageSrc>;
    },
    [primaryChainEnv, perpMetadataByChainEnv],
  );

  const getIsHiddenMarket = useCallback(
    (productId: number): boolean => {
      return hiddenProductIdsByChainEnv[primaryChainEnv].has(productId);
    },
    [primaryChainEnv, hiddenProductIdsByChainEnv],
  );

  const getIsNewMarket = useCallback(
    (productId: number): boolean => {
      return newProductIdsByChainEnv[primaryChainEnv].has(productId);
    },
    [primaryChainEnv, newProductIdsByChainEnv],
  );

  const primaryChainEnvMetadata = useMemo(
    () => getChainEnvMetadata(primaryChainEnv),
    [primaryChainEnv],
  );

  const data: NadoMetadataContextData = useMemo(() => {
    return {
      primaryQuoteToken: primaryQuoteTokenByChainEnv[
        primaryChainEnv
      ] as Token<MetadataContextImageSrc>,
      getIsHiddenMarket,
      getIsNewMarket,
      getPerpMetadata,
      getSpotMetadata,
      getChainEnvMetadata,
      getSpotMetadataByChainEnv,
      primaryChainEnvMetadata,
    };
  }, [
    primaryQuoteTokenByChainEnv,
    getIsHiddenMarket,
    getIsNewMarket,
    getPerpMetadata,
    getSpotMetadata,
    getSpotMetadataByChainEnv,
    primaryChainEnv,
    primaryChainEnvMetadata,
  ]);

  return <NadoMetadataContext value={data}>{children}</NadoMetadataContext>;
}
