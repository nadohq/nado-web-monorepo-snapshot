import {
  CustomNumberFormatSpecifier,
  formatNumber,
} from '@nadohq/react-client';
import { Icons } from '@nadohq/web-ui';
import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { ToastProps } from 'client/components/Toast/types';
import { NotificationMarketDisplay } from 'client/modules/notifications/components/NotificationMarketDisplay';
import { ToastLabelWithValue } from 'client/modules/notifications/components/ToastLabelWithValue';
import { DepositNotificationData } from 'client/modules/notifications/types';
import { useTranslation } from 'react-i18next';

interface Props extends ToastProps {
  data: DepositNotificationData;
}

export function DepositSuccessNotification({ data, onDismiss, ttl }: Props) {
  const { t } = useTranslation();

  const formattedAmount = formatNumber(data.amount, {
    formatSpecifier: CustomNumberFormatSpecifier.NUMBER_PRECISE,
  });

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader
        variant="success"
        icon={Icons.CheckCircle}
        onDismiss={onDismiss}
      >
        {t(($) => $.notifications.depositReceived)}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body variant="success" className="flex flex-col gap-y-2">
        <NotificationMarketDisplay
          marketIcon={data.icon.asset}
          marketName={data.symbol}
          productType={null}
        />
        <ToastLabelWithValue
          label={t(($) => $.amount)}
          value={formattedAmount}
        />
      </ActionToast.Body>
    </ActionToast.Container>
  );
}
