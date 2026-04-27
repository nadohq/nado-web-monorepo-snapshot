import { WithChildren } from '@nadohq/web-common';
import { useSizeClass } from '@nadohq/web-ui';
import { useGetConfirmedTx } from 'client/hooks/util/useGetConfirmedTx';
import { NotificationPosition } from 'client/modules/localstorage/userState/types/tradingSettings';
import { FeatureNotificationsEmitter } from 'client/modules/notifications/emitters/FeatureNotificationsEmitter';
import { SmartContractWalletHelperEventEmitter } from 'client/modules/notifications/emitters/SmartContractWalletHelperEventEmitter';
import { SubaccountNotificationsEventEmitter } from 'client/modules/notifications/emitters/SubaccountNotificationsEventEmitter';
import { handleActionErrorHandlerNotificationDispatch } from 'client/modules/notifications/handlers/handleActionErrorHandlerNotificationDispatch';
import { handleCancelMultiOrdersNotificationDispatch } from 'client/modules/notifications/handlers/handleCancelMultiOrdersNotificationDispatch';
import { handleCancelOrderNotificationDispatch } from 'client/modules/notifications/handlers/handleCancelOrderNotificationDispatch';
import { handleCctpBridgeNotificationDispatch } from 'client/modules/notifications/handlers/handleCctpBridgeNotificationDispatch';
import { handleCloseMultiPositionsNotificationDispatch } from 'client/modules/notifications/handlers/handleCloseMultiPositionsNotificationDispatch';
import { handleClosePositionNotificationDispatch } from 'client/modules/notifications/handlers/handleClosePositionNotificationDispatch';
import { handleDepositSuccessNotificationDispatch } from 'client/modules/notifications/handlers/handleDepositSuccessNotificationDispatch';
import { handleFeatureNotificationDispatch } from 'client/modules/notifications/handlers/handleFeatureNotificationDispatch';
import { handleLiquidationNotificationDispatch } from 'client/modules/notifications/handlers/handleLiquidationNotificationDispatch';
import { handleMaintMarginUsageNotificationDispatch } from 'client/modules/notifications/handlers/handleMaintMarginUsageNotificationDispatch';
import { handleMarginUsageWarningNotificationDispatch } from 'client/modules/notifications/handlers/handleMarginUsageWarningNotificationDispatch';
import { handleOrderFillNotificationDispatch } from 'client/modules/notifications/handlers/handleOrderFillNotificationDispatch';
import { handlePlaceOrderNotificationDispatch } from 'client/modules/notifications/handlers/handlePlaceOrderNotificationDispatch';
import { handleSmartContractWalletHelperNotificationDispatch } from 'client/modules/notifications/handlers/handleSmartContractWalletHelperNotificationDispatch';
import { handleUsdt0BridgeNotificationDispatch } from 'client/modules/notifications/handlers/handleUsdt0BridgeNotificationDispatch';
import { useNotificationPosition } from 'client/modules/notifications/hooks/useNotificationPosition';
import {
  NotificationManagerContext,
  NotificationManagerContextData,
} from 'client/modules/notifications/NotificationManagerContext';
import {
  DispatchNotificationParams,
  NotificationDispatchContext,
} from 'client/modules/notifications/types';
import { useEnableTradingNotifications } from 'client/modules/trading/hooks/useEnableTradingNotifications';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster, ToasterProps } from 'sonner';

const NOTIFICATION_TO_TOASTER_POSITION_MAP: Record<
  NotificationPosition,
  ToasterProps['position']
> = {
  left: 'bottom-left',
  right: 'bottom-right',
};

export function NotificationManagerContextProvider({ children }: WithChildren) {
  const { t } = useTranslation();
  const { enableTradingNotifications } = useEnableTradingNotifications();

  const getConfirmedTx = useGetConfirmedTx();

  const { value: sizeClass } = useSizeClass();

  const { notificationPosition } = useNotificationPosition();

  const toasterPosition =
    NOTIFICATION_TO_TOASTER_POSITION_MAP[notificationPosition];

  const dispatchContext: NotificationDispatchContext = useMemo(() => {
    return {
      t,
      getConfirmedTx,
      sizeClass,
      enableTradingNotifications,
    };
  }, [t, getConfirmedTx, sizeClass, enableTradingNotifications]);

  const dispatchNotification = useCallback(
    (params: DispatchNotificationParams) => {
      switch (params.type) {
        case 'action_error_handler':
          handleActionErrorHandlerNotificationDispatch(
            params.data,
            dispatchContext,
          );
          break;
        case 'cancel_order':
          handleCancelOrderNotificationDispatch(params.data, dispatchContext);
          break;
        case 'cancel_multi_orders':
          handleCancelMultiOrdersNotificationDispatch(
            params.data,
            dispatchContext,
          );
          break;
        case 'close_multi_positions':
          handleCloseMultiPositionsNotificationDispatch(
            params.data,
            dispatchContext,
          );
          break;
        case 'place_order':
          handlePlaceOrderNotificationDispatch(params.data, dispatchContext);
          break;
        case 'close_position':
          handleClosePositionNotificationDispatch(params.data, dispatchContext);
          break;
        case 'order_fill':
          handleOrderFillNotificationDispatch(params.data, dispatchContext);
          break;
        case 'maint_margin_usage_warning':
          handleMaintMarginUsageNotificationDispatch(params.data);
          break;
        case 'margin_usage_warning':
          handleMarginUsageWarningNotificationDispatch();
          break;
        case 'smart_contract_wallet_helper':
          handleSmartContractWalletHelperNotificationDispatch();
          break;
        case 'liquidation':
          handleLiquidationNotificationDispatch(params.data);
          break;
        case 'new_feature':
          handleFeatureNotificationDispatch(params.data);
          break;
        case 'deposit_success':
          handleDepositSuccessNotificationDispatch(params.data);
          break;
        case 'cctp_bridge':
          handleCctpBridgeNotificationDispatch(params.data);
          break;
        case 'usdt0_bridge':
          handleUsdt0BridgeNotificationDispatch(params.data, dispatchContext);
          break;
      }
    },
    [dispatchContext],
  );

  const data: NotificationManagerContextData = useMemo(() => {
    return {
      dispatchNotification,
    };
  }, [dispatchNotification]);

  return (
    <NotificationManagerContext value={data}>
      <Toaster
        position={toasterPosition}
        gap={8}
        visibleToasts={4}
        // pointer-events-auto for workaround: https://github.com/radix-ui/primitives/issues/2690#issuecomment-2009617202
        className="group/toast-container pointer-events-auto"
        offset={{
          // Enough offset to be above footer
          bottom: '40px',
          right: '16px',
          left: '16px',
        }}
        mobileOffset="16px"
      />
      <SubaccountNotificationsEventEmitter />
      <FeatureNotificationsEmitter />
      <SmartContractWalletHelperEventEmitter />
      {children}
    </NotificationManagerContext>
  );
}
