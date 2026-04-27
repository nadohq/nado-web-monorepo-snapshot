import { BigNumber } from 'bignumber.js';
import { CancellableOrderTableItem } from 'client/modules/tables/types/CancellableOrderTableItem';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';

export interface OpenEngineOrderTableItem
  extends ProductTableItem, CancellableOrderTableItem {
  timePlacedMillis: number;
  filledBaseSize: BigNumber;
}
