import type { TradingCompTrack } from 'client/modules/tradingCompetition/types';
import { DataEnv } from 'common/environment/baseClientEnv';
import { clientEnv } from 'common/environment/clientEnv';
import { sum } from 'lodash';

const ROI_PRIZES_USD = [
  22500, 13500, 9000, 6750, 5250, 4500, 3750, 3750, 3000, 3000,
] as const;
const VOLUME_PRIZES_USD = [
  7500, 4500, 3000, 2250, 1750, 1500, 1250, 1250, 1000, 1000,
] as const;

const MAINNET_TRADING_COMP_TRACKS: readonly TradingCompTrack[] = [
  {
    type: 'roi',
    contestId: 2,
    rankType: 'roi',
    prizesUsd: ROI_PRIZES_USD,
  },
  {
    type: 'volume',
    contestId: 2,
    rankType: 'volume',
    prizesUsd: VOLUME_PRIZES_USD,
  },
] as const;

const TESTNET_TRADING_COMP_TRACKS: readonly TradingCompTrack[] = [
  {
    type: 'roi',
    contestId: 20,
    rankType: 'roi',
    prizesUsd: ROI_PRIZES_USD,
  },
  {
    type: 'volume',
    contestId: 20,
    rankType: 'volume',
    prizesUsd: VOLUME_PRIZES_USD,
  },
] as const;

const TRADING_COMP_TRACKS_BY_DATA_ENV: Record<
  DataEnv,
  readonly TradingCompTrack[]
> = {
  nadoMainnet: MAINNET_TRADING_COMP_TRACKS,
  nadoTestnet: TESTNET_TRADING_COMP_TRACKS,
  local: TESTNET_TRADING_COMP_TRACKS,
};

export const TRADING_COMP_TRACKS =
  TRADING_COMP_TRACKS_BY_DATA_ENV[clientEnv.base.dataEnv];

export const ALL_TRADING_COMP_CONTEST_IDS: number[] = Array.from(
  new Set(TRADING_COMP_TRACKS.map((track) => track.contestId)),
);

export const LEADERBOARD_PAGE_SIZE = 10;

export const TOTAL_TRADING_COMP_PRIZE_POOL_USD = sum(
  TRADING_COMP_TRACKS.flatMap((track) => track.prizesUsd),
);

// ISO-3166-1 alpha-2 country codes (uppercase) blocked from accessing the
// trading competition. This is intentionally distinct from the platform-wide
// geoblock list.
export const TRADING_COMP_RESTRICTED_COUNTRY_CODES: readonly string[] = [
  'GB',
  'IT',
  'PA',
];
