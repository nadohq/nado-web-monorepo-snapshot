import type { BigNumber } from 'bignumber.js';
import { TRADING_COMP_TRACKS } from 'client/modules/tradingCompetition/consts';
import { useQuerySubaccountTradingCompParticipant } from 'client/modules/tradingCompetition/hooks/query/useQuerySubaccountTradingCompParticipant';
import { useQueryTradingCompContests } from 'client/modules/tradingCompetition/hooks/query/useQueryTradingCompContests';
import type { TradingCompTrack } from 'client/modules/tradingCompetition/types';
import { useTradingCompEnrollment } from 'client/pages/TradingCompetition/hooks/useTradingCompEnrollment';
import { useMemo } from 'react';

export type TradingCompTrackStatus =
  | 'not_enrolled'
  | 'insufficient_account_value'
  | 'insufficient_volume'
  | 'insufficient_account_value_and_volume'
  | 'qualified';

export interface TradingCompCardData {
  track: TradingCompTrack;
  // `undefined` while participant data is still loading.
  status: TradingCompTrackStatus | undefined;
  accountValueThresholdUsd: BigNumber | undefined;
  volumeThresholdUsd: BigNumber | undefined;
  metricValue: BigNumber | undefined;
  rank: BigNumber | undefined;
}

export function useTradingCompCards() {
  const { data: participantData } = useQuerySubaccountTradingCompParticipant();
  const { data: contestsData } = useQueryTradingCompContests();
  const { isEnrolled } = useTradingCompEnrollment();

  const mappedTrackCards = useMemo(() => {
    return TRADING_COMP_TRACKS.map((track) => {
      const trackPosition =
        participantData?.participant?.[track.contestId]?.tracks[track.rankType];

      const contestTrack = contestsData?.contests
        .find((contest) => contest.contestId === track.contestId)
        ?.tracks.find((candidate) => candidate.rankType === track.rankType);

      const status: TradingCompTrackStatus | undefined = (() => {
        if (!trackPosition) {
          return undefined;
        }

        if (!isEnrolled) {
          return 'not_enrolled';
        }

        return trackPosition.qualificationStatus;
      })();

      return {
        track,
        status,
        accountValueThresholdUsd: contestTrack?.accountValueThreshold,
        volumeThresholdUsd: contestTrack?.volumeThreshold,
        metricValue: trackPosition?.value,
        rank: trackPosition?.rank,
      };
    });
  }, [participantData, isEnrolled, contestsData]);

  return { mappedTrackCards };
}
