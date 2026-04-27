import { BalanceSide } from '@nadohq/client';
import {
  formatNumber,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { TOAST_WIDTH } from 'client/components/Toast/consts';
import { ToastProps } from 'client/components/Toast/types';
import { NotificationMarketDisplay } from 'client/modules/notifications/components/NotificationMarketDisplay';
import { NotificationOrderInfoDisplay } from 'client/modules/notifications/components/NotificationOrderInfoDisplay';
import { PartialFillIcon } from 'client/modules/notifications/components/orders/OrderFillNotification/PartialFillIcon';
import { useOrderFilledNotification } from 'client/modules/notifications/components/orders/OrderFillNotification/useOrderFilledNotification';
import { OrderFillNotificationData } from 'client/modules/notifications/types';
import { getOrderTypeLabel } from 'client/modules/trading/utils/getOrderTypeLabel';
import { useTranslation } from 'react-i18next';

interface OrderFillNotificationProps extends ToastProps {
  data: OrderFillNotificationData;
}

export function OrderFillNotification({
  data,
  ttl,
  onDismiss,
}: OrderFillNotificationProps) {
  const { t } = useTranslation();

  const notificationData = useOrderFilledNotification(data);

  if (!notificationData) {
    // Approximate height of ActionToast to avoid layout shift
    // This is required because Sonner does not support dynamic height toasts
    return <div className={joinClassNames('h-23', TOAST_WIDTH)} />;
  }

  const {
    decimalAdjustedFilledAmount,
    fillStatus,
    fillPrice,
    orderAppendix,
    metadata,
    market,
  } = notificationData;

  const fillTypeLabel = (() => {
    if (orderAppendix.triggerType === 'price') {
      return t(($) => $.orderStatus.triggered);
    }

    if (fillStatus === 'partial') {
      return t(($) => $.partiallyFilled);
    }

    return t(($) => $.fullyFilled);
  })();

  const orderSide: BalanceSide = decimalAdjustedFilledAmount.isPositive()
    ? 'long'
    : 'short';
  const sideVerb = orderSide === 'long' ? t(($) => $.bought) : t(($) => $.sold);

  const formattedAmount = formatNumber(decimalAdjustedFilledAmount.abs(), {
    formatSpecifier: getMarketSizeFormatSpecifier({
      sizeIncrement: metadata.sizeIncrement,
    }),
  });

  const formattedFillPrice = formatNumber(fillPrice, {
    formatSpecifier: getMarketPriceFormatSpecifier(metadata.priceIncrement),
  });

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader
        variant="success"
        onDismiss={onDismiss}
        icon={fillStatus === 'partial' ? PartialFillIcon : undefined} // If undefined `icon` uses the default icon set in component
      >
        {getOrderTypeLabel({
          t,
          orderAppendix,
          orderSide,
          priceTriggerCriteria: undefined,
        })}{' '}
        {fillTypeLabel}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body variant="success" className="flex flex-col gap-y-2">
        <NotificationMarketDisplay
          marketIcon={metadata.icon.asset}
          marketName={metadata.marketName}
          productType={market.type}
        />
        <NotificationOrderInfoDisplay
          sideLabel={sideVerb}
          amount={formattedAmount}
          price={formattedFillPrice}
        />
      </ActionToast.Body>
    </ActionToast.Container>
  );
}
