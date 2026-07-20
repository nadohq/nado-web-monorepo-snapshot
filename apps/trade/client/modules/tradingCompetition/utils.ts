import { IndexerLeaderboardRankType, toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { TRADING_COMP_TRACKS } from 'client/modules/tradingCompetition/consts';

export type CompetitionPhase = 'upcoming' | 'active' | 'ended';

/**
 * Returns the USD prize for a given rank (1-indexed) and rank type.
 * Ranks outside the prize list receive no prize.
 */
export function getPrizeUsdForRank(
  rank: number,
  rankType: IndexerLeaderboardRankType,
): BigNumber | undefined {
  const prize = TRADING_COMP_TRACKS.find((track) => track.rankType === rankType)
    ?.prizesUsd[rank - 1];

  if (prize == null) {
    return undefined;
  }

  return toBigNumber(prize);
}
