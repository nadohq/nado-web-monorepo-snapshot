import { asyncResult, removeDecimals, toBigNumber } from '@nadohq/client';
import { DEFAULT_TOAST_TTL } from 'client/components/Toast/consts';
import { ActionErrorNotification } from 'client/modules/notifications/components/ActionErrorNotification';
import { PlaceOrderSuccessNotification } from 'client/modules/notifications/components/orders/PlaceOrderSuccessNotification';
import {
  NotificationDispatchContext,
  PlaceOrderNotificationData,
} from 'client/modules/notifications/types';
import { getPlaceOrderTypeLabel } from 'client/modules/trading/utils/getPlaceOrderTypeLabel';
import { isUserDeniedError } from 'client/utils/errors/isUserDeniedError';
import { parseExecuteError } from 'client/utils/errors/parseExecuteError';
import { first } from 'lodash';
import { toast } from 'sonner';

export async function handlePlaceOrderNotificationDispatch(
  placeOrderNotificationData: PlaceOrderNotificationData,
  { t, enableTradingNotifications, sendGTMEvent }: NotificationDispatchContext,
) {
  const verifyOrderActionResult = async () => {
    const awaitedResult = await placeOrderNotificationData.executeResult;

    return first(awaitedResult.data)?.digest;
  };

  const [digest, orderActionError] = await asyncResult(
    verifyOrderActionResult(),
  );

  const valueUsd = Math.round(
    toBigNumber(
      removeDecimals(placeOrderNotificationData.placeOrderParams.amount),
    )
      .multipliedBy(placeOrderNotificationData.metadata.displayOraclePrice ?? 0)
      .abs()
      .toNumber(),
  );

  if (!orderActionError) {
    if (enableTradingNotifications) {
      toast.custom(
        (toastId) => {
          return (
            <PlaceOrderSuccessNotification
              ttl={DEFAULT_TOAST_TTL}
              orderData={placeOrderNotificationData}
              onDismiss={() => {
                toast.dismiss(toastId);
              }}
            />
          );
        },
        { id: `place-order-${digest}`, duration: DEFAULT_TOAST_TTL },
      );
    }
    sendGTMEvent({
      event: 'place_order',
      market: placeOrderNotificationData.metadata.marketName,
      iso: !!placeOrderNotificationData.placeOrderParams.iso,
      valueUsd,
      digest: digest ?? '',
    });
  } else if (!isUserDeniedError(orderActionError)) {
    const parsedError = parseExecuteError(t, orderActionError);

    toast.custom(
      (toastId) => {
        return (
          <ActionErrorNotification
            title={t(($) => $.errors.orderTypeOrderFailed, {
              orderType: getPlaceOrderTypeLabel(
                t,
                placeOrderNotificationData.orderType,
              ),
            })}
            error={parsedError}
            ttl={DEFAULT_TOAST_TTL}
            onDismiss={() => {
              toast.dismiss(toastId);
            }}
          />
        );
      },
      { duration: DEFAULT_TOAST_TTL },
    );
    sendGTMEvent({
      event: 'place_order_error',
      market: placeOrderNotificationData.metadata.marketName,
      iso: !!placeOrderNotificationData.placeOrderParams.iso,
      valueUsd,
      errorMessage: parsedError.errorMessage,
    });
  }
}
