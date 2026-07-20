import { IndexerLeaderboardRankType } from '@nadohq/client';

export type TradingCompTrackType = 'roi' | 'volume';

/** A rank type within a single contest (e.g. Volume / PnL for contest 1). */
export interface TradingCompTrack {
  /**
   * The kind of track the UI renders, narrowed to the variants we support.
   * Discriminates display concerns (i18n keys, tooltips, formatting, colors)
   * and doubles as the track's unique identifier.
   */
  type: TradingCompTrackType;
  /** The contest ID from the indexer. */
  contestId: number;
  /** The rank type from the indexer. */
  rankType: IndexerLeaderboardRankType;
  /** Ordered USD prizes by rank (index 0 = 1st place, etc.). */
  prizesUsd: readonly number[];
}
