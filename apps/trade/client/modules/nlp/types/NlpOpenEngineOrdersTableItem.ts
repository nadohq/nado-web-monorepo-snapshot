import { OpenEngineOrderTableItem } from 'client/modules/tables/types/OpenEngineOrderTableItem';

export type NlpOpenEngineOrdersTableItem = Omit<
  OpenEngineOrderTableItem,
  'orderForCancellation'
>;
