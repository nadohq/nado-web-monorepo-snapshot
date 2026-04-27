import { useSubaccountDepositEventEmitter } from 'client/modules/notifications/emitters/hooks/useSubaccountDepositEventEmitter';
import { useSubaccountFillOrderEventEmitter } from 'client/modules/notifications/emitters/hooks/useSubaccountFillOrderEventEmitter';
import { useSubaccountLiquidationEventEmitter } from 'client/modules/notifications/emitters/hooks/useSubaccountLiquidationEventEmitter';
import { useSubaccountRiskEventEmitter } from 'client/modules/notifications/emitters/hooks/useSubaccountRiskEventEmitter';

/**
 * A persistent null component that listens for subaccount events and dispatches notifications
 */
export function SubaccountNotificationsEventEmitter() {
  useSubaccountDepositEventEmitter();
  useSubaccountFillOrderEventEmitter();
  useSubaccountRiskEventEmitter();
  useSubaccountLiquidationEventEmitter();
  return null;
}
