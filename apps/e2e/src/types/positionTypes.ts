import { BalanceSide } from '@nadohq/client';
import { Expected, MarginMode } from 'src/types/commonTypes';

export interface Position {
  market: string;
  direction: BalanceSide;
  marginMode: MarginMode;
  size: string;
  value: string;
  entryPrice: string;
  oraclePrice: string;
  estLiqPrice: string;
  tpsl: string;
  estPnl: string;
  margin: string;
  funding: string;
}

/** Expected data structure for Position assertions */
export type ExpectedPosition = Expected<Position>;
