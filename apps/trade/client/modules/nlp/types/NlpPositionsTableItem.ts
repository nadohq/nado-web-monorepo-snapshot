import { PerpPositionsTableItem } from 'client/modules/tables/types/PerpPositionsTableItem';

/**
 * NLP Positions are always cross and do not have TP/SL or estimated liquidation price.
 */
export type NlpPositionsTableItem = Omit<
  PerpPositionsTableItem,
  | 'isoSubaccountName'
  | 'tpSl'
  | 'estimatedLiquidationPrice'
  | 'estimatedExitPrice'
>;
