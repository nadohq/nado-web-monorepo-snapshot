import { PriceTriggerCriteria } from '@nadohq/client';
import { CancellableOrderTableItem } from 'client/modules/tables/types/CancellableOrderTableItem';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';

export interface OpenPriceTriggerOrderTableItem
  extends ProductTableItem, CancellableOrderTableItem {
  timePlacedMillis: number;
  priceTriggerCriteria: PriceTriggerCriteria;
}
