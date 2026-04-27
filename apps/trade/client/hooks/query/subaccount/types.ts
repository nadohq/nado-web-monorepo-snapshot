import { IndexerOrder, TriggerOrderInfo } from '@nadohq/client';

export interface TriggerOrderInfoWithEngineOrder extends TriggerOrderInfo {
  triggeredEngineOrder?: IndexerOrder;
}
