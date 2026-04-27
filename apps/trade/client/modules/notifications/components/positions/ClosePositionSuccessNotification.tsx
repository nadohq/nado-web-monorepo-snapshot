import { ProductEngineType } from '@nadohq/client';
import {
  formatNumber,
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { ToastProps } from 'client/components/Toast/types';
import { NotificationMarketDisplay } from 'client/modules/notifications/components/NotificationMarketDisplay';
import { OrderSuccessIcon } from 'client/modules/notifications/components/OrderSuccessIcon';
import { ToastLabelWithValue } from 'client/modules/notifications/components/ToastLabelWithValue';
import { ClosePositionNotificationData } from 'client/modules/notifications/types';
import { useTranslation } from 'react-i18next';

interface ClosePositionNotificationProps extends ToastProps {
  data: ClosePositionNotificationData['closePositionParams'];
}

export function ClosePositionSuccessNotification({
  data,
  onDismiss,
  ttl,
}: ClosePositionNotificationProps) {
  const { t } = useTranslation();

  const { metadata, size, fraction, limitPrice } = data;

  const formattedAmountFraction = formatNumber(fraction, {
    formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
  });

  const formattedSize = formatNumber(size.abs(), {
    formatSpecifier: getMarketSizeFormatSpecifier({
      sizeIncrement: metadata.sizeIncrement,
      shouldRemoveDecimals: false,
    }),
  });

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader
        variant="success"
        icon={OrderSuccessIcon}
        onDismiss={onDismiss}
      >
        {limitPrice
          ? t(($) => $.notifications.limitCloseOrderPlaced)
          : t(($) => $.notifications.marketCloseOrderPlaced)}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body variant="success" className="flex flex-col gap-y-2">
        <NotificationMarketDisplay
          marketIcon={metadata.icon.asset}
          marketName={metadata.marketName}
          productType={ProductEngineType.PERP}
        />
        <ToastLabelWithValue
          label={t(($) => $.amount)}
          value={t(($) => $.notifications.closePositionAmountValue, {
            size: formattedSize,
            fraction: formattedAmountFraction,
          })}
        />
      </ActionToast.Body>
    </ActionToast.Container>
  );
}
