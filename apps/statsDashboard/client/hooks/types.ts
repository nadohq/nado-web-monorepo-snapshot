import { ChainEnv } from '@nadohq/client';
import {
  AnnotatedPerpMarket,
  AnnotatedSpotMarket,
  EdgeChainEnv,
} from '@nadohq/react-client';

// This is important such that we can label Spot markets with their associated `chainEnv`.
interface EdgeSpotMetadata {
  chainEnv: ChainEnv;
}

// Perp markets have `edge` as their `chainEnv`.
interface EdgePerpMetadata {
  chainEnv: EdgeChainEnv;
}

export type EdgeAnnotatedSpotMarket = AnnotatedSpotMarket & EdgeSpotMetadata;

export type EdgeAnnotatedPerpMarket = AnnotatedPerpMarket & EdgePerpMetadata;

export type EdgeAnnotatedMarket =
  | EdgeAnnotatedSpotMarket
  | EdgeAnnotatedPerpMarket;
