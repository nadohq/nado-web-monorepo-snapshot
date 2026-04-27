import { CustomizableTableConfig } from 'client/modules/tables/customizableTables/types';

export const PERP_POSITIONS_DEFAULT_COLUMN_ORDER = [
  'positionSize',
  'notionalValueUsd',
  'averageEntryPrice',
  'oraclePrice',
  'estimatedLiquidationPrice',
  'tpSl',
  'pnlInfo',
  'margin',
  'netFunding',
] as const;

export type PerpPositionsColumnId =
  | (typeof PERP_POSITIONS_DEFAULT_COLUMN_ORDER)[number]
  | 'productName'
  | 'actions';

export const perpConfig: CustomizableTableConfig<PerpPositionsColumnId> = {
  defaultColumnOrder: PERP_POSITIONS_DEFAULT_COLUMN_ORDER,
};
