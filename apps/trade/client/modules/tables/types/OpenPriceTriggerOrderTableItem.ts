import { PriceTriggerCriteria } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { CancellableOrderTableItem } from 'client/modules/tables/types/CancellableOrderTableItem';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';

export interface OpenPriceTriggerOrderTableItem
  extends ProductTableItem, CancellableOrderTableItem {
  timePlacedMillis: number;
  priceTriggerCriteria: PriceTriggerCriteria;
  displayTriggerPrice: BigNumber;
}
