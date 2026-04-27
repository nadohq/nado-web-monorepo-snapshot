import { TriggerOrderInfo } from '@nadohq/client';

export interface ModifyTpSlDialogParams {
  productId: number;
  isIso: boolean;
  /**
   * The existing order to edit
   */
  order: TriggerOrderInfo;
}
