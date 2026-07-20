import {
  GetIndexerPaginatedLeaderboardResponse,
  IndexerLeaderboardParticipant,
  IndexerLeaderboardRankType,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useQueryEnsNames } from 'client/hooks/query/useQueryEnsNames';
import { LEADERBOARD_PAGE_SIZE } from 'client/modules/tradingCompetition/consts';
import { usePaginatedTradingCompLeaderboard } from 'client/modules/tradingCompetition/hooks/query/usePaginatedTradingCompLeaderboard';
import { getPrizeUsdForRank } from 'client/modules/tradingCompetition/utils';
import { useMemo } from 'react';
import { getAddress, isAddress } from 'viem';

export interface TradingCompLeaderboardTableItem extends WithDataTableRowId {
  address: string;
  ensName: string | undefined;
  twitterUsername: string | undefined;
  twitterProfileUrl: string | undefined;
  currentRank: BigNumber | undefined;
  roi: BigNumber | undefined;
  volumeUsd: BigNumber | undefined;
  prizeUsd: BigNumber | undefined;
}

interface Params {
  contestId: number;
  rankType: IndexerLeaderboardRankType;
}

function extractItems(data: GetIndexerPaginatedLeaderboardResponse) {
  return data.participants;
}

export function useTradingCompLeaderboardTable({
  contestId,
  rankType,
}: Params) {
  const {
    currentPageData: participants,
    isLoading,
    isFetchingCurrPage,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedTradingCompLeaderboard,
    queryParams: {
      pageSize: LEADERBOARD_PAGE_SIZE,
      contestId,
      rankType,
    },
    extractItems,
  });

  const participantAddresses = useMemo(
    () => participants?.map((p) => p.subaccount.subaccountOwner),
    [participants],
  );

  const { data: ensNamesByAddress } = useQueryEnsNames({
    addresses: participantAddresses,
  });

  const data: TradingCompLeaderboardTableItem[] | undefined = useMemo(
    () =>
      participants?.map((participant: IndexerLeaderboardParticipant) => {
        const twitterUsername = participant.socialAccounts.find(
          (account) => account.provider === 'twitter',
        )?.username;

        const prizeUsd = participant.tracks[rankType]?.rank
          ? getPrizeUsdForRank(
              participant.tracks[rankType]?.rank?.toNumber(),
              rankType,
            )
          : undefined;

        const rawAddress = participant.subaccount.subaccountOwner;
        // ENS lookups are keyed by checksummed addresses; mirror the
        // normalization done inside `useQueryEnsNames` so we hit its map.
        const ensName = isAddress(rawAddress)
          ? ensNamesByAddress?.[getAddress(rawAddress)]
          : undefined;

        return {
          rowId: `${participant.subaccount.subaccountOwner}-${participant.subaccount.subaccountName}`,
          address: rawAddress,
          ensName,
          twitterUsername,
          twitterProfileUrl: twitterUsername
            ? `https://x.com/${encodeURIComponent(twitterUsername)}`
            : undefined,
          currentRank: participant.tracks[rankType]?.rank,
          roi: participant.tracks.roi?.value,
          volumeUsd: participant.tracks.volume?.value,
          prizeUsd,
        };
      }),
    [participants, rankType, ensNamesByAddress],
  );

  return {
    data,
    isLoading: isLoading || isFetchingCurrPage,
    pagination,
  };
}
