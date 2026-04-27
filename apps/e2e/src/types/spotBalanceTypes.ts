import { Expected } from 'src/types/commonTypes';

export interface SpotBalance {
  symbol: string;
  amount: string;
  value: string;
  depositApy: string;
  borrowApy: string;
  estimatedPnl: string | undefined;
  netInterest: string;
}

export type ExpectedSpotBalance = Expected<SpotBalance>;
